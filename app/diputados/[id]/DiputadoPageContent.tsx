"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import type {Acta, Diputado, SortConfig} from "@/lib/types"
import {formatDate, sortActas} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle, MinusCircle, XCircle} from "lucide-react"
import {Progress} from "@/components/ui/progress"

export default function DiputadoPageContent({diputado}: { diputado: Diputado }) {
  const router = useRouter()
  const [sortConfig, setSortConfig] = useState<SortConfig>({key: "fecha", direction: "desc"})

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({key, direction})
  }

  if (!diputado) {
    return (
      <div className="page-container">
        <Card>
          <CardHeader>
            <CardTitle>Diputado no encontrado</CardTitle>
            <CardDescription>No se pudo encontrar información para el diputado solicitado.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const actasSorted = sortActas(diputado.actasDiputado || [], sortConfig)

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
              <CheckCircle className="h-5 w-5 text-teal-500"/>
              <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Afirmativo</span>
            </div>
          case "negativo":
            return <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500"/>
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Negativo</span>
            </div>
          case "abstencion":
            return <div className="flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-blue-500"/>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Abstención</span>
            </div>

          default:
            return <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground"/>
              <span className="text-sm font-medium text-muted-foreground">Ausente</span>
            </div>
        }
      },
    },
  ]

  return (
    <div className="page-container flex flex-col gap-10">
      <Card>
        <CardContent className="px-0 py-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full max-w-xs mx-auto lg:mx-0 md:max-w-sm flex flex-col justify-end">
              {
                diputado.foto ? (
                  <Avatar className="w-full h-full max-h-96 rounded-none">
                    <AvatarImage
                      src={diputado.foto}
                      alt={`${diputado.nombre} ${diputado.apellido}`}
                    />
                  </Avatar>
                ) : (
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage
                      src={"/placeholder.svg?height=120&width=120"}
                      alt={`${diputado.nombre} ${diputado.apellido}`}
                    />
                    <AvatarFallback
                      className="text-2xl">{`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}</AvatarFallback>
                  </Avatar>
                )
              }
            </div>

            <div className="flex flex-col gap-2 flex-1 p-6">
              <CardTitle>{`${diputado.nombre} ${diputado.apellido}`}</CardTitle>

              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 gap-4">
                {diputado.estadisticas && (<div className="grid grid-cols-1 gap-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-3 bg-teal-50 dark:bg-teal-950">
                      <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                        {diputado.estadisticas.votosAfirmativos}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">Votos Afirmativos</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                      <div
                        className="text-3xl font-bold text-red-600 dark:text-red-400">{diputado.estadisticas.votosNegativos}</div>
                      <div className="text-sm font-medium text-muted-foreground">Votos Negativos</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {diputado.estadisticas.abstenciones}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">Abstenciones</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium text-muted-foreground">Total Votaciones</div>
                        <div className="text-2xl font-bold">{diputado.estadisticas.totalVotaciones}</div>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-950">
                        <div className="text-sm font-medium text-muted-foreground">Ausencias</div>
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {diputado.estadisticas.ausencias}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Presentismo</span>
                        <span className="text-sm font-medium">{diputado.estadisticas.presentismo}%</span>
                      </div>
                      <Progress value={diputado.estadisticas.presentismo} className="h-2"/>
                    </div>
                  </div>
                </div>)}
              </div>
            </div>
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

