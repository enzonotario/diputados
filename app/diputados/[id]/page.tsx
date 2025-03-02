"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDiputadoById, getActas } from "@/lib/api"
import type { Diputado, Acta } from "@/lib/types"
import { formatDate, calcularEstadisticasDiputado } from "@/lib/utils"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle, XCircle, MinusCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function DiputadoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [diputado, setDiputado] = useState<Diputado | null>(null)
  const [actas, setActas] = useState<Acta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (typeof params.id === "string") {
        const diputadoData = await getDiputadoById(params.id)
        const actasData = await getActas()

        setDiputado(diputadoData)
        setActas(actasData)
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!diputado) {
    return (
      <div className="container py-10">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Diputado no encontrado</CardTitle>
            <CardDescription>No se pudo encontrar información para el diputado solicitado.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Filtrar actas donde participó el diputado
  const actasDiputado = actas.filter((acta) => acta.votos.some((voto) => voto.diputado === diputado.id))

  // Calcular estadísticas
  const estadisticas = calcularEstadisticasDiputado(diputado.id, actas)

  // Columnas para la tabla de votaciones
  const columnasVotaciones = [
    {
      key: "fecha",
      title: "Fecha",
      sortable: true,
      render: (acta: Acta) => formatDate(acta.fecha),
    },
    {
      key: "titulo",
      title: "Título",
      sortable: true,
    },
    {
      key: "resultado",
      title: "Resultado",
      sortable: true,
      render: (acta: Acta) => (
        <Badge variant={acta.resultado === "APROBADO" ? "success" : "destructive"}>{acta.resultado}</Badge>
      ),
    },
    {
      key: "voto",
      title: "Voto",
      render: (acta: Acta) => {
        const voto = acta.votos.find((v) => v.diputado === diputado.id)
        if (!voto) return <AlertCircle className="h-5 w-5 text-muted-foreground" />

        switch (voto.tipoVoto.toLowerCase()) {
          case "afirmativo":
            return <CheckCircle className="h-5 w-5 text-green-500" />
          case "negativo":
            return <XCircle className="h-5 w-5 text-red-500" />
          case "abstencion":
            return <MinusCircle className="h-5 w-5 text-yellow-500" />
          default:
            return <AlertCircle className="h-5 w-5 text-muted-foreground" />
        }
      },
    },
  ]

  return (
    <div className="container py-10">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={diputado.foto || "/placeholder.svg?height=80&width=80"}
                alt={`${diputado.nombre} ${diputado.apellido}`}
              />
              <AvatarFallback className="text-2xl">{`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{`${diputado.nombre} ${diputado.apellido}`}</CardTitle>
              <CardDescription>{diputado.provincia}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Bloque</h3>
                <p>{diputado.bloque}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Período de Mandato</h3>
                <p>{`${formatDate(diputado.periodoMandato.inicio)} - ${formatDate(diputado.periodoMandato.fin)}`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fecha de Juramento</h3>
                <p>{formatDate(diputado.juramentoFecha)}</p>
              </div>
              {diputado.ceseFecha && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de Cese</h3>
                  <p>{formatDate(diputado.ceseFecha)}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Género</h3>
                <p>{diputado.genero}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Estadísticas de Participación</CardTitle>
            <CardDescription>Resumen de la actividad parlamentaria del diputado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Presentismo</span>
                  <span className="text-sm font-medium">{estadisticas.presentismo}%</span>
                </div>
                <Progress value={estadisticas.presentismo} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Votaciones</div>
                  <div className="text-2xl font-bold">{estadisticas.totalVotaciones}</div>
                </div>
                <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
                  <div className="text-sm font-medium text-muted-foreground">Votos Afirmativos</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {estadisticas.votosAfirmativos}
                  </div>
                </div>
                <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                  <div className="text-sm font-medium text-muted-foreground">Votos Negativos</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticas.votosNegativos}</div>
                </div>
                <div className="rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950">
                  <div className="text-sm font-medium text-muted-foreground">Abstenciones</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {estadisticas.abstenciones}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Votaciones</CardTitle>
          <CardDescription>Registro de votaciones en las que ha participado el diputado</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={actasDiputado}
            columns={columnasVotaciones}
            searchable
            searchKeys={["titulo", "resultado", "fecha"]}
            onRowClick={(acta) => router.push(`/actas/${acta.id}`)}
            emptyMessage="No se encontraron votaciones para este diputado."
          />
        </CardContent>
      </Card>
    </div>
  )
}

