import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Diputado, Acta, SortConfig, FilterConfig } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function isDiputadoActivo(diputado: Diputado): boolean {
  const now = new Date()
  const finMandato = new Date(diputado.periodoMandato.fin)

  return finMandato > now
}

export function sortDiputados(diputados: Diputado[], sortConfig: SortConfig): Diputado[] {
  return [...diputados].sort((a, b) => {
    let aValue: any
    let bValue: any

    // Manejar propiedades anidadas
    if (sortConfig.key.includes(".")) {
      const [parent, child] = sortConfig.key.split(".")
      aValue = a[parent as keyof Diputado]?.[child]
      bValue = b[parent as keyof Diputado]?.[child]
    } else {
      aValue = a[sortConfig.key as keyof Diputado]
      bValue = b[sortConfig.key as keyof Diputado]
    }

    // Convertir a minúsculas si son strings para ordenar sin distinguir mayúsculas/minúsculas
    if (typeof aValue === "string") aValue = aValue.toLowerCase()
    if (typeof bValue === "string") bValue = bValue.toLowerCase()

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })
}

export function filterDiputados(diputados: Diputado[], filters: FilterConfig): Diputado[] {
  return diputados.filter((diputado) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === "") return true

      // Manejar propiedades anidadas
      if (key.includes(".")) {
        const [parent, child] = key.split(".")
        const parentValue = diputado[parent as keyof Diputado]
        if (typeof parentValue === "object" && parentValue !== null) {
          const childValue = parentValue[child as keyof typeof parentValue]
          if (typeof childValue === "string") {
            return childValue.toLowerCase().includes(String(value).toLowerCase())
          }
          return childValue === value
        }
        return false
      }

      const diputadoValue = diputado[key as keyof Diputado]

      if (typeof diputadoValue === "string") {
        return diputadoValue.toLowerCase().includes(String(value).toLowerCase())
      }

      return diputadoValue === value
    })
  })
}

export function sortActas(actas: Acta[], sortConfig: SortConfig): Acta[] {
  return [...actas].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Acta]
    const bValue = b[sortConfig.key as keyof Acta]

    // Convertir a minúsculas si son strings para ordenar sin distinguir mayúsculas/minúsculas
    const aCompare = typeof aValue === "string" ? aValue.toLowerCase() : aValue
    const bCompare = typeof bValue === "string" ? bValue.toLowerCase() : bValue

    if (aCompare < bCompare) return sortConfig.direction === "asc" ? -1 : 1
    if (aCompare > bCompare) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })
}

export function filterActas(actas: Acta[], filters: FilterConfig): Acta[] {
  return actas.filter((acta) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === "") return true

      const actaValue = acta[key as keyof Acta]

      if (key === "fechaStart") {
        return new Date(acta.fecha) >= new Date(value as string)
      } else if (key === "fechaEnd") {
        return new Date(acta.fecha) <= new Date(value as string)
      }

      if (typeof actaValue === "string") {
        if (value === "all") {
          return true
        }
        return actaValue.toLowerCase().includes(String(value).toLowerCase())
      } else if (typeof actaValue === "number") {
        // Para filtros numéricos, podemos implementar comparaciones
        const numValue = Number(value)
        if (key.includes("Min")) {
          const actualKey = key.replace("Min", "")
          return acta[actualKey as keyof Acta] >= numValue
        } else if (key.includes("Max")) {
          const actualKey = key.replace("Max", "")
          return acta[actualKey as keyof Acta] <= numValue
        }
        return actaValue === numValue
      }

      return actaValue === value
    })
  })
}

export function getUniqueValues(items: any[], key: string): string[] {
  const values = new Set<string>()

  items.forEach((item) => {
    // Manejar propiedades anidadas
    if (key.includes(".")) {
      const [parent, child] = key.split(".")
      const parentValue = item[parent]
      if (typeof parentValue === "object" && parentValue !== null) {
        const childValue = parentValue[child]
        if (childValue) values.add(String(childValue))
      }
    } else {
      const value = item[key]
      if (value) values.add(String(value))
    }
  })

  return Array.from(values).sort()
}

export function getYearsFromActas(actas: Acta[]): string[] {
  const years = new Set<string>()

  actas.forEach((acta) => {
    if (acta.fecha) {
      const year = new Date(acta.fecha).getFullYear().toString()
      years.add(year)
    }
  })

  return Array.from(years).sort((a, b) => b.localeCompare(a)) // Ordenar de más reciente a más antiguo
}

export function calcularEstadisticasDiputado(diputado: Diputado, actas: Acta[]) {
  let totalVotaciones = 0
  let votosAfirmativos = 0
  let votosNegativos = 0
  let abstenciones = 0
  let ausencias = 0

  actas.forEach((acta) => {
    totalVotaciones++

    const voto = acta.votos.find((v) => v.diputado === `${diputado.apellido}, ${diputado.nombre}`)

    if (!voto) {
      return
    }

    switch (voto.tipoVoto.toLowerCase()) {
      case "afirmativo":
        votosAfirmativos++
        break
      case "negativo":
        votosNegativos++
        break
      case "abstencion":
        abstenciones++
        break
      case "ausente":
        ausencias++
      default:
        break
    }
  })

  const presentismo = totalVotaciones > 0 ? ((totalVotaciones - ausencias) / totalVotaciones) * 100 : 0

  return {
    totalVotaciones,
    votosAfirmativos,
    votosNegativos,
    abstenciones,
    ausencias,
    presentismo: Math.round(presentismo * 10) / 10, // Redondear a 1 decimal
  }
}

