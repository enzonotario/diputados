import type {Acta, Diputado, Voto} from "@/lib/types"
import {collect} from "collect.js"
import {calcularEstadisticasDiputado, isDiputadoActivo} from "@/lib/utils";
import sluggo from "sluggo"
import colors from "tailwind-colors";

const API_BASE_URL = "https://api.argentinadatos.com/v1/diputados"

const diputadosAliases = [
  {
    nombreCompleto: "Acevedo, Sergio",
    aliases: [
      "Acevedo, Sergio Edgardo",
      "Acevedo, Sergio",
    ],
  },
  {
    nombreCompleto: "Moreau, Leopoldo Raul Guido",
    aliases: [
      "Moreau, Leopoldo Raul Guido",
      "Moreau, Leopoldo",
    ],
  },
  {
    nombreCompleto: "Reyes, Roxana Nahir",
    aliases: [
      "Reyes, Roxana Nahir",
      "Reyes, Roxana",
    ],
  },
]

let diputados
let actas
let diputadosConActas

export async function getDiputados(): Promise<Diputado[]> {
  if (diputados) {
    return diputados
  }

  try {
    const response = await fetch(`${API_BASE_URL}/diputados`)
    if (!response.ok) {
      throw new Error(`Error fetching diputados: ${response.statusText}`)
    }
    diputados = collect(await response.json())
      .sortBy("id")
      .sortByDesc("periodoMandato.inicio")
      .sortByDesc("periodoBloque.inicio")
      .groupBy("id")
      .map((diputados) => diputados.first())
      .map((diputado) => ({
        ...diputado,
        nombreCompleto: `${diputado.apellido}, ${diputado.nombre}`,
      }))
      .toArray() as Diputado[]

    return diputados
  } catch (error) {
    console.error("Error fetching diputados:", error)
    return []
  }
}

export async function getDiputadoById(id: string): Promise<Diputado | null> {
  try {
    const diputados = await getDiputados()
    return diputados.find((diputado) => diputado.id === id) || null
  } catch (error) {
    console.error(`Error fetching diputado with id ${id}:`, error)
    return null
  }
}

export async function getActas(): Promise<Acta[]> {
  if (actas) {
    return actas
  }

  try {
    const response = await fetch(`${API_BASE_URL}/actas`)
    if (!response.ok) {
      throw new Error(`Error fetching actas: ${response.statusText}`)
    }
    actas = (await response.json()).map((acta: Acta) => ({
      ...acta,
      votos: acta.votos.filter((voto) => voto.tipoVoto !== "presidente")
    }))

    return actas
  } catch (error) {
    console.error("Error fetching actas:", error)
    return []
  }
}

export async function getActaById(id: string): Promise<Acta | null> {
  try {
    const actas = await getActas()
    return actas.find((acta) => acta.id === id) || null
  } catch (error) {
    console.error(`Error fetching acta with id ${id}:`, error)
    return null
  }
}

export async function getDiputadosConActas(): Promise<Diputado[]> {
  if (diputadosConActas) {
    return diputadosConActas
  }

  try {
    const diputados = (await getDiputados()).map((diputado) => ({
      ...diputado,
      nombreSlug: sluggo(`${diputado.apellido}, ${diputado.nombre}`),
    }))

    const actas = (await getActas()).map((acta) => ({
      ...acta,
      votos: acta.votos.map((voto) => ({
        ...voto,
        diputadoSlug: sluggo(voto.diputado),
      } as Voto)),
    }))

    diputadosConActas = diputados
      .map((diputado) => {
        const actasDiputado = actas
          .filter((acta) => acta.votos.some((voto) => voto.diputadoSlug === diputado.nombreSlug) || acta.votos.some((voto) => {
            const diputadoByAlias = diputadosAliases.find((alias) => alias.aliases.includes(voto.diputado))
            return diputadoByAlias && diputadoByAlias.nombreCompleto === diputado.nombreCompleto
          }))
          .map((acta) => {
            let votoDiputado = acta.votos.find((voto) => voto.diputadoSlug === diputado.nombreSlug)

            if (!votoDiputado) {
              votoDiputado = acta.votos.find((voto) => {
                const diputadoByAlias = diputadosAliases.find((alias) => alias.aliases.includes(voto.diputado))
                return diputadoByAlias && diputadoByAlias.nombreCompleto === diputado.nombreCompleto
              })
            }

            return {
              ...acta,
              votoDiputado,
              tipoVotoDiputado: votoDiputado?.tipoVoto,
            }
          })
        const estadisticas = calcularEstadisticasDiputado(actasDiputado)
        return {...diputado, estadisticas, actasDiputado}
      })

    return diputadosConActas
  } catch (error) {
    console.error("Error fetching diputados con actas:", error)
    return []
  }
}

export async function getActaWithDiputadosById(id: string): Promise<Acta | null> {
  try {
    const actaById = await getActaById(id)
    if (!actaById) {
      return null
    }

    const acta = {
      ...actaById,
      votos: (actaById?.votos || []).map((voto) => ({
        ...voto,
        diputadoSlug: sluggo(voto.diputado),
      }))
    } as Acta

    const diputados = (await getDiputados()).map((diputado) => ({
      ...diputado,
      nombreSlug: sluggo(diputado.nombreCompleto),
    }))

    return {
      ...acta,
      votos: acta.votos.map((voto) => {
        let diputado = diputados.find((diputado) => diputado.nombreSlug === voto.diputadoSlug)

        if (!diputado) {
          const diputadoByAlias = diputadosAliases.find((alias) => alias.aliases.includes(voto.diputado))

          if (diputadoByAlias) {
            diputado = diputados.find((diputado) => diputado.nombreCompleto === diputadoByAlias.nombreCompleto)
          }
        }

        return {
          ...voto,
          diputadoObj: {
            ...(diputado || {
              id: voto.diputadoSlug,
              nombre: voto.diputado,
              apellido: "",
              nombreCompleto: voto.diputado,
              nombreSlug: voto.diputadoSlug,
              genero: "",
              provincia: "",
              periodoMandato: {
                inicio: "",
                fin: "",
              },
              juramentoFecha: "",
              ceseFecha: "",
              bloque: "",
              periodoBloque: {
                inicio: "",
                fin: "",
              },
              foto: "",
            } as Diputado),
            tipoVoto: voto.tipoVoto,
          }
        }
      })
    } as Acta
  } catch (error) {
    console.error(`Error fetching acta with id ${id}:`, error)
    return null
  }
}

const generarColorPorBloque = () => {
  const coloresPreasignados: Record<string, string> = {
    "Movimiento Popular  Neuquino": colors.blue[500],
    "La Libertad Avanza": colors.purple[500],
    "Independencia": colors.red[500],
    "Hacemos Coalicion Federal": colors.green[500],
    "Frente de Izquierda y de Trabajadores Unidad": colors.blue[400],
    "Sin Bloque": colors.gray[500],
    "Produccion y Trabajo": colors.yellow[500],
    "Pro": colors.yellow[500],
    "Ucr - Union Civica Radical": colors.red[500],
    "Union por la Patria": colors.blue[500],
    "Creo": colors.blue[500],
    "La Union Mendocina": colors.blue[500],
    "Innovacion Federal": colors.blue[300],
    "Buenos Aires Libre": colors.blue[200],
    "Por Santa Cruz": colors.blue[600],
    "Avanza Libertad": colors.purple[600]
  };

  const coloresBase = [
    "#e57373", "#f06292", "#ba68c8", "#9575cd",
    "#7986cb", "#64b5f6", "#4fc3f7", "#4dd0e1",
    "#4db6ac", "#81c784", "#aed581", "#dce775",
    "#fff176", "#ffd54f", "#ffb74d", "#ff8a65"
  ];

  let indiceColor = 0;
  return (bloque: string) => {
    if (coloresPreasignados[bloque]) {
      return coloresPreasignados[bloque];
    }

    const color = coloresBase[indiceColor % coloresBase.length];
    indiceColor++;
    return color;
  };
};

export async function getDiputadosPorBloques() {
  const diputados = (await getDiputados()).filter(isDiputadoActivo);
  const bloqueColores: Record<string, string> = {};
  const getColor = generarColorPorBloque();

  const bloques = [...new Set(diputados.map(d => d.bloque))];
  bloques.forEach(bloque => {
    bloqueColores[bloque] = getColor(bloque);
  })

  return {
    diputados,
    bloqueColores,
  };
}
