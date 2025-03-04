"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {getActaById, getDiputados} from "@/lib/api"
import type {Acta, Diputado, SortConfig} from "@/lib/types"
import {formatDate, sortDiputados} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle, Loader2, MinusCircle, User, XCircle} from "lucide-react"
import {Progress} from "@/components/ui/progress";
import {VotacionesProgress} from "@/components/votaciones-progress";

export default function ActaPageContent({id}: {id: string}) {
  const router = useRouter()
  const [acta, setActa] = useState<Acta | null>(null)
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "nombreCompleto", direction: "asc" })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const actaData = await getActaById(id)
      const diputadosData = await getDiputados()

      setActa(actaData)
      setDiputados(diputadosData)

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

  if (!acta) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acta no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar información para el acta solicitada.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const votosConDiputados = acta.votos.map((voto) => {
    const diputado = diputados.find((d) => `${d.apellido}, ${d.nombre}` === voto.diputado)
    return {
      ...voto,
      nombreCompleto: diputado ? `${diputado.apellido}, ${diputado.nombre}` : voto.diputado,
      provincia: diputado?.provincia || "Desconocida",
      bloque: diputado?.bloque || "Desconocido",
      foto: diputado?.foto || "",
      diputadoId: diputado?.id,
    }
  })

  const votosConDiputadosSorted = sortDiputados(votosConDiputados, sortConfig)

  const total = acta.votosAfirmativos + acta.votosNegativos + acta.abstenciones + acta.ausentes
  const presentes = acta.votosAfirmativos + acta.votosNegativos + acta.abstenciones
  const ausentes = acta.ausentes
  const presentismo = ((presentes / total) * 100).toFixed(0)
  const votosAfirmativos = acta.votosAfirmativos || 0
  const votosNegativos = acta.votosNegativos || 0
  const abstenciones = acta.abstenciones || 0

  const columnasVotos = [
    {
      key: "foto",
      title: "",
      render: (voto: any) => (
        <Avatar>
          <AvatarImage src={voto.foto || "/placeholder.svg?height=40&width=40"} alt={voto.nombreCompleto} />
          <AvatarFallback>{voto.nombreCompleto.substring(0, 2)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "nombreCompleto",
      title: "Diputado",
      sortable: true,
    },
    {
      key: "bloque",
      title: "Bloque",
      sortable: true,
    },
    {
      key: "provincia",
      title: "Provincia",
      sortable: true,
    },
    {
      key: "tipoVoto",
      title: "Voto",
      sortable: true,
      render: (voto: any) => {
        switch (voto.tipoVoto.toLowerCase()) {
          case "afirmativo":
            return (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Afirmativo</span>
              </div>
            )
          case "negativo":
            return (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Negativo</span>
              </div>
            )
          case "abstencion":
            return (
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Abstención</span>
              </div>
            )
          case "ausente":
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Ausente</span>
              </div>
            )
          default:
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{voto.tipoVoto}</span>
              </div>
            )
        }
      },
    },
  ]

  return (
    <div className="container flex flex-col py-10 gap-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{acta.titulo}</CardTitle>
            </div>
            <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"} className="text-base py-1 px-3">
              {acta.resultado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-wrap gap-3 sm:gap-6">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">Acta N°</dt>
              <dd>{acta.numeroActa}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">Fecha</dt>
              <dd>{formatDate(acta.fecha)}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">Período</dt>
              <dd>{acta.periodo}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">Reunión</dt>
              <dd>{acta.reunion}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">Presidente</dt>
              <dd>{acta.presidente}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia</CardTitle>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-teal-700 dark:text-teal-400">{presentes}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Presentes</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-red-700 dark:text-red-400">{ausentes}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Ausentes</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {[...Array(presentes)].map((_, i) => (
                    <User
                        key={`presente-${i}`}
                        className="size-3 md:size-4 text-teal-500 dark:text-teal-400"
                    />
                ))}
                {[...Array(ausentes)].map((_, i) => (
                    <User
                        key={`ausente-${i}`}
                        className="size-3 md:size-4 text-red-500 dark:text-red-400"
                    />
                ))}
              </div>
            </div>
          </CardContent>

          <div>
            <div className="flex justify-center gap-2 px-2 pb-2">
              <span className="text-sm">Presentismo</span>
              <span className="text-sm font-medium">{presentismo}%</span>
            </div>
            <Progress value={presentismo} className="h-2 rounded-t-none" />
          </div>
        </Card>

        <Card className="flex flex-col rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-teal-700 dark:text-teal-400">{votosAfirmativos}</span>
                  <p className="text-sm text-gray-500">Afirmativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-red-700 dark:text-red-400">{votosNegativos}</span>
                  <p className="text-sm text-gray-500">Negativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-orange-700 dark:text-orange-400">{abstenciones}</span>
                  <p className="text-sm text-gray-500">Abstenciones</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {[...Array(votosAfirmativos)].map((_, i) => (
                    <CheckCircle
                        key={`afirmativo-${i}`}
                        className="size-3 md:size-4 text-teal-500 dark:text-teal-400"
                    />
                ))}
                {[...Array(votosNegativos)].map((_, i) => (
                    <XCircle
                        key={`negativo-${i}`}
                        className="size-3 md:size-4 text-red-500 dark:text-red-400"
                    />
                ))}
                {[...Array(abstenciones)].map((_, i) => (
                    <MinusCircle
                        key={`abstencion-${i}`}
                        className="size-3 md:size-4 text-orange-500 dark:text-orange-400"
                    />
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex-1"></div>
          <VotacionesProgress acta={acta} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votos de los Diputados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={votosConDiputadosSorted}
            columns={columnasVotos}
            searchable
            searchKeys={["nombreCompleto", "bloque", "provincia", "tipoVoto"]}
            onRowClick={(voto) => router.push(`/diputados/${voto.diputadoId}`)}
            emptyMessage="No se encontraron votos para esta acta."
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  )
}

