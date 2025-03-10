"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {getDiputadosConActas} from "@/lib/api"
import type {Acta, Diputado, SortConfig} from "@/lib/types"
import {formatDate, sortActas} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle, Loader2, MinusCircle, XCircle} from "lucide-react"
import {Progress} from "@/components/ui/progress"

export default function DiputadoPageContent({id}: {id: string}) {
  const router = useRouter()
  const [diputado, setDiputado] = useState<Diputado | null>(null)
  const [estadisticas, setEstadisticas] = useState<Diputado["estadisticas"] | null>(null)
  const [actas, setActas] = useState<Acta[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "fecha", direction: "desc" })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const diputados = await getDiputadosConActas()

      const diputado = diputados.find((diputado) => diputado.id === id) || null

      setDiputado(diputado)

      const actasDiputado = diputado?.actasDiputado || []
      setActas(actasDiputado)

      if (diputado) {
        setEstadisticas(diputado.estadisticas)
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction })
  }

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
        <Card>
          <CardHeader>
            <CardTitle>Diputado no encontrado</CardTitle>
            <CardDescription>No se pudo encontrar información para el diputado solicitado.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const actasSorted = sortActas(actas, sortConfig)

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
        <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"}>{acta.resultado}</Badge>
      ),
    },
    {
      key: "tipoVotoDiputado",
      title: "Voto",
      sortable: true,
      render: (acta: Acta) => {
        switch (acta.tipoVotoDiputado?.toLowerCase()) {
          case "afirmativo":
            return <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-500" />
              <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Afirmativo</span>
            </div>
          case "negativo":
            return <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Negativo</span>
            </div>
          case "abstencion":
            return <div className="flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Abstención</span>
            </div>

          default:
            return <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Ausente</span>
            </div>
        }
      },
    },
  ]

  return (
    <div className="container flex flex-col py-10 gap-10">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="size-32">
            <AvatarImage
              src={diputado.foto || "/placeholder.svg?height=120&width=120"}
              alt={`${diputado.nombre} ${diputado.apellido}`}
            />
            <AvatarFallback className="text-2xl">{`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}</AvatarFallback>
          </Avatar>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardTitle>{`${diputado.nombre} ${diputado.apellido}`}</CardTitle>

            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Provincia</dt>
                <dd>{diputado.provincia}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Bloque</dt>
                <dd>{diputado.bloque}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Género</dt>
                <dd>{diputado.genero}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Período de Mandato</dt>
                <dd>{`${formatDate(diputado.periodoMandato.inicio)} - ${formatDate(diputado.periodoMandato.fin)}`}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Fecha de Juramento</dt>
                <dd>{formatDate(diputado.juramentoFecha)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Fecha de Cese</dt>
                <dd>{diputado.ceseFecha ? formatDate(diputado.ceseFecha) : "-"}</dd>
              </div>
            </dl>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {estadisticas && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-3 bg-teal-50 dark:bg-teal-950">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {estadisticas.votosAfirmativos}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Votos Afirmativos</div>
                </div>
                <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{estadisticas.votosNegativos}</div>
                  <div className="text-sm font-medium text-muted-foreground">Votos Negativos</div>
                </div>
                <div className="rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {estadisticas.abstenciones}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Abstenciones</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Total Votaciones</div>
                    <div className="text-2xl font-bold">{estadisticas.totalVotaciones}</div>
                  </div>

                  <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-950">
                    <div className="text-sm font-medium text-muted-foreground">Ausencias</div>
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {estadisticas.ausencias}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Presentismo</span>
                    <span className="text-sm font-medium">{estadisticas.presentismo}%</span>
                  </div>
                  <Progress value={estadisticas.presentismo} className="h-2" />
                </div>
              </div>
            </div>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Votaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={actasSorted}
            columns={columnasVotaciones}
            searchable
            searchKeys={["titulo", "resultado", "fecha"]}
            onRowClick={(acta) => router.push(`/actas/${acta.id}`)}
            emptyMessage="No se encontraron votaciones para este diputado."
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  )
}

