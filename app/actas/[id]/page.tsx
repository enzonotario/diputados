"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {getActaById, getDiputados} from "@/lib/api"
import type {Acta, Diputado} from "@/lib/types"
import {formatDate} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle, Loader2, MinusCircle, User, XCircle} from "lucide-react" // Íconos de ejemplo, ajusta según tu librería

export default function ActaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [acta, setActa] = useState<Acta | null>(null)
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (typeof params.id === "string") {
        const actaData = await getActaById(params.id)
        const diputadosData = await getDiputados()

        setActa(actaData)
        setDiputados(diputadosData)
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

  // Preparar datos para la tabla de votos
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

  // Calcular porcentajes para la visualización
  const total = acta.votosAfirmativos + acta.votosNegativos + acta.abstenciones + acta.ausentes
  const presentes = acta.presentes || acta.votos.filter(v => v.tipoVoto !== "ausente").length
  const ausentes = acta.ausentes || acta.votos.filter(v => v.tipoVoto === "ausente").length
  const votosAfirmativos = acta.votosAfirmativos || 0
  const votosNegativos = acta.votosNegativos || 0
  const abstenciones = acta.abstenciones || 0

  // Columnas para la tabla de votos
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
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-teal-500 mr-2" />
                <span>Afirmativo</span>
              </div>
            )
          case "negativo":
            return (
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span>Negativo</span>
              </div>
            )
          case "abstencion":
            return (
              <div className="flex items-center">
                <MinusCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <span>Abstención</span>
              </div>
            )
          default:
            return (
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <span>{voto.tipoVoto}</span>
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
              <CardDescription>
                <div className="flex flex-row flex-wrap gap-4">
                  <div className="flex gap-2">
                    <span>Acta N°:</span>
                    <span className="font-medium">{acta.numeroActa}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>Fecha:</span>
                    <span className="font-medium">{formatDate(acta.fecha)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>Período:</span>
                    <span className="font-medium">{acta.periodo}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>Reunión:</span>
                    <span className="font-medium">{acta.reunion}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>Presidente:</span>
                    <span className="font-medium">{acta.presidente}</span>
                  </div>
                </div>

              </CardDescription>
            </div>
            <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"} className="text-base py-1 px-3">
              {acta.resultado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">Asistencia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-3xl font-bold text-teal-700 dark:text-teal-400">{presentes}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Presentes</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-3xl font-bold text-red-700 dark:text-red-400">{ausentes}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Ausentes</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...Array(presentes)].map((_, i) => (
                    <User
                        key={`presente-${i}`}
                        className="h-6 w-6 text-teal-500 dark:text-teal-400"
                    />
                ))}
                {[...Array(ausentes)].map((_, i) => (
                    <User
                        key={`ausente-${i}`}
                        className="h-6 w-6 text-red-500 dark:text-red-400"
                    />
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">Resultados</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-3xl font-bold text-teal-700 dark:text-teal-400">{votosAfirmativos}</span>
                  <p className="text-sm text-gray-500">Afirmativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-3xl font-bold text-red-700 dark:text-red-400">{votosNegativos}</span>
                  <p className="text-sm text-gray-500">Negativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-3xl font-bold text-orange-700 dark:text-orange-400">{abstenciones}</span>
                  <p className="text-sm text-gray-500">Abstenciones</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...Array(votosAfirmativos)].map((_, i) => (
                    <CheckCircle
                        key={`afirmativo-${i}`}
                        className="h-6 w-6 text-teal-500 dark:text-teal-400"
                    />
                ))}
                {[...Array(votosNegativos)].map((_, i) => (
                    <XCircle
                        key={`negativo-${i}`}
                        className="h-6 w-6 text-red-500 dark:text-red-400"
                    />
                ))}
                {[...Array(abstenciones)].map((_, i) => (
                    <MinusCircle
                        key={`abstencion-${i}`}
                        className="h-6 w-6 text-orange-500 dark:text-orange-400"
                    />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Votos de los Diputados</CardTitle>
          <CardDescription>Registro de votos emitidos por cada diputado</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={votosConDiputados}
            columns={columnasVotos}
            searchable
            searchKeys={["nombreCompleto", "bloque", "provincia", "tipoVoto"]}
            onRowClick={(voto) => router.push(`/diputados/${voto.diputadoId}`)}
            emptyMessage="No se encontraron votos para esta acta."
          />
        </CardContent>
      </Card>
    </div>
  )
}

