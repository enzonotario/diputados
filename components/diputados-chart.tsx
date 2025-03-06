"use client"

import { useEffect, useState } from 'react'
import { getDiputados } from '@/lib/api'
import { Diputado } from '@/lib/types'
import { isDiputadoActivo } from '@/lib/utils'
import {Loader2, Users} from 'lucide-react'
import colors from 'tailwind-colors'
import {useTheme} from "next-themes";
import Link from "next/link";
import {Button} from "@/components/ui/button";

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
  }

  // Colores adicionales para bloques no predefinidos
  const coloresBase = [
    "#e57373", "#f06292", "#ba68c8", "#9575cd",
    "#7986cb", "#64b5f6", "#4fc3f7", "#4dd0e1",
    "#4db6ac", "#81c784", "#aed581", "#dce775",
    "#fff176", "#ffd54f", "#ffb74d", "#ff8a65"
  ]

  let indiceColor = 0
  return (bloque: string) => {
    if (coloresPreasignados[bloque]) {
      return coloresPreasignados[bloque]
    }

    const color = coloresBase[indiceColor % coloresBase.length]
    indiceColor++
    return color
  }
}

export function DiputadosChart() {
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)
  const [bloqueColores, setBloqueColores] = useState<Record<string, string>>({})
  const isDark = useTheme().theme === "dark"

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getDiputados()
      const diputadosActivos = data.filter(isDiputadoActivo).sort((a, b) => a.bloque.localeCompare(b.bloque))
      setDiputados(diputadosActivos)

      const coloresMap: Record<string, string> = {}
      const getColor = generarColorPorBloque()

      const bloques = [...new Set(diputadosActivos.map(d => d.bloque))]
      bloques.forEach(bloque => {
        coloresMap[bloque] = getColor(bloque)
      })

      setBloqueColores(coloresMap)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Agrupar diputados por bloque para el conteo
  const bloqueConteo: Record<string, number> = {}
  diputados.forEach(d => {
    bloqueConteo[d.bloque] = (bloqueConteo[d.bloque] || 0) + 1
  })

  // Ordenar bloques por cantidad de diputados (de mayor a menor)
  const bloquesOrdenados = Object.keys(bloqueConteo).sort(
    (a, b) => bloqueConteo[b] - bloqueConteo[a]
  )

  // Configuración del hemiciclo
  const width = 1000
  const height = 500
  const outerRadius = Math.min(width, height) * 0.8
  const innerRadius = outerRadius * 0.4

  // Calcular posiciones para cada diputado en formato hemiciclo
  const puntos: { x: number; y: number; diputado: Diputado }[] = []
  const totalDiputados = diputados.length

  // Ángulo de inicio y fin (en radianes) para el semicírculo
  const startAngle = Math.PI // Lado izquierdo
  const endAngle = 0 // Lado derecho

  // Número de filas en el hemiciclo
  const numFilas = 5

  // Calcular cuántos asientos por fila (desde exterior a interior)
  const asientosPorFila = []
  const totalAsientos = totalDiputados

  // Distribución de asientos por fila (más asientos en filas exteriores)
  let asientosRestantes = totalAsientos
  for (let i = 0; i < numFilas; i++) {
    // Fórmula para distribuir proporcionalmente más asientos en las filas exteriores
    const ratio = (numFilas - i) / ((numFilas * (numFilas + 1)) / 2)
    const asientosEnFila = Math.round(totalAsientos * ratio)
    asientosPorFila.push(Math.min(asientosEnFila, asientosRestantes))
    asientosRestantes -= asientosPorFila[i]
  }

  // Agrupar diputados por bloque
  let asientosAsignados = 0

  // Para cada fila (de exterior a interior)
  for (let fila = 0; fila < numFilas; fila++) {
    const radioFila = innerRadius + (outerRadius - innerRadius) * (1 - fila / numFilas)
    const asientosEnFila = asientosPorFila[fila]

    // Distribución de asientos en esta fila
    for (let pos = 0; pos < asientosEnFila && asientosAsignados < totalDiputados; pos++) {
      const angulo = startAngle - (startAngle - endAngle) * (pos / (asientosEnFila - 1 || 1))

      // Calcular coordenadas cartesianas
      const x = width / 2 + radioFila * Math.cos(angulo)
      const y = height - 50 - radioFila * Math.sin(angulo)

      if (asientosAsignados < totalDiputados) {
        puntos.push({
          x,
          y,
          diputado: diputados[asientosAsignados]
        })
        asientosAsignados++
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Diputados de la Nación Argentina</h2>

        <p className="text-center text-muted-foreground">
          {diputados.length} diputados distribuidos en {bloquesOrdenados.length} bloques
        </p>

        <div className="w-full max-w-xl mx-auto flex justify-center overflow-x-auto">
          <svg width={width} height="100%" viewBox={`0 0 ${width} ${height}`}>
            {/* Fondo del semicírculo */}
            <path
              d={`M ${width/2 - outerRadius} ${height - 50} 
                  A ${outerRadius} ${outerRadius} 0 0 1 ${width/2 + outerRadius} ${height - 50}
                  L ${width/2 + innerRadius} ${height - 50}
                  A ${innerRadius} ${innerRadius} 0 0 0 ${width/2 - innerRadius} ${height - 50}
                  Z`}
              fill={isDark ? colors.gray[800] : colors.gray[200]}
            />

            {/* Dibujar puntos por diputado */}
            {puntos.map((punto, i) => (
              <circle
                key={i}
                cx={punto.x}
                cy={punto.y}
                r={6}
                fill={bloqueColores[punto.diputado.bloque]}
                stroke="#fff"
                strokeWidth={1}
                data-tooltip-content={`${punto.diputado.nombreCompleto} (${punto.diputado.bloque})`}
              />
            ))}
          </svg>
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-wrap justify-start sm:justify-center gap-4 mt-4">
          {bloquesOrdenados.map(bloque => (
            <div key={bloque} className="flex items-center gap-2 sm:text-center">
              <div
                style={{ backgroundColor: bloqueColores[bloque] }}
                className="w-4 h-4 rounded-full"
              />
              <span className="text-sm">{bloque} ({bloqueConteo[bloque]})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/diputados">
            <Users className="h-4 w-4" />
            <span>Ver Diputados</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/diputados/bloques">
            <Users className="h-4 w-4" />
            <span>Ver Diputados por Bloque</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
