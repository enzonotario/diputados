"use client"

import {useEffect, useState} from 'react'
import {getDiputados} from '@/lib/api'
import {Diputado} from '@/lib/types'
import {isDiputadoActivo} from '@/lib/utils'
import {Loader2} from 'lucide-react'
import colors from 'tailwind-colors'
import {useTheme} from "next-themes"
import Link from "next/link"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Card, CardContent} from "@/components/ui/card"

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

export function DiputadosGrid() {
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)
  const [bloqueColores, setBloqueColores] = useState<Record<string, string>>({})
  const {theme} = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getDiputados()
      const diputadosActivos = data.filter(isDiputadoActivo)
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
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    )
  }

  // Agrupar diputados por bloque
  const diputadosPorBloque: Record<string, Diputado[]> = {}
  diputados.forEach(diputado => {
    if (!diputadosPorBloque[diputado.bloque]) {
      diputadosPorBloque[diputado.bloque] = []
    }
    diputadosPorBloque[diputado.bloque].push(diputado)
  })

  // Ordenar bloques por cantidad de diputados (de mayor a menor)
  const bloquesOrdenados = Object.keys(diputadosPorBloque).sort(
    (a, b) => diputadosPorBloque[b].length - diputadosPorBloque[a].length
  )

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {bloquesOrdenados.map(bloque => (
        <Card key={bloque} className="overflow-hidden">
          <div
            className="h-2"
            style={{backgroundColor: bloqueColores[bloque]}}
          />
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4 flex-wrap">
              <h3 className="text-lg font-semibold">{bloque}</h3>
              <span className="text-sm text-muted-foreground">
                {diputadosPorBloque[bloque].length} diputados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center">
              {diputadosPorBloque[bloque].map(diputado => (
                <Link
                  href={`/diputados/${diputado.id}`}
                  key={diputado.id}
                  className="flex flex-col items-center group"
                >
                  <Avatar className="size-16 sm:size-10 lg:size-14 xl:size-20 mb-2 transition-transform group-hover:scale-110">
                    <AvatarImage
                      src={diputado.foto || "/placeholder.svg?height=64&width=64"}
                      alt={`${diputado.nombre} ${diputado.apellido}`}
                    />
                    <AvatarFallback className="text-sm">
                      {`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center truncate max-w-full">
                    {diputado.apellido}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
