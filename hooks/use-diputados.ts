import {useEffect, useState} from 'react';
import {getDiputados} from '@/lib/api';
import {Diputado} from '@/lib/types';
import {isDiputadoActivo} from '@/lib/utils';
import colors from 'tailwind-colors';

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

export function useDiputados() {
  const [diputados, setDiputados] = useState<Diputado[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloqueColores, setBloqueColores] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getDiputados();
      const diputadosActivos = data.filter(isDiputadoActivo);
      setDiputados(diputadosActivos);

      const coloresMap: Record<string, string> = {};
      const getColor = generarColorPorBloque();

      const bloques = [...new Set(diputadosActivos.map(d => d.bloque))];
      bloques.forEach(bloque => {
        coloresMap[bloque] = getColor(bloque);
      });

      setBloqueColores(coloresMap);
      setLoading(false);
    }

    fetchData();
  }, []);

  return { diputados, loading, bloqueColores };
}
