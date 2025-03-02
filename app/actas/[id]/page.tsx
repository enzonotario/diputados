"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getActaById, getDiputados } from "@/lib/api"
import type { Acta, Diputado } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle, XCircle, MinusCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
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
    const diputado = diputados.find((d) => d.id === voto.diputado)
    return {
      ...voto,
      nombreCompleto: diputado ? `${diputado.apellido}, ${diputado.nombre}` : voto.diputado,
      provincia: diputado?.provincia || "Desconocida",
      bloque: diputado?.bloque || "Desconocido",
      foto: diputado?.foto || "",
    }
  })

  // Calcular porcentajes para la visualización
  const total = acta.votosAfirmativos + acta.votosNegativos + acta.abstenciones + acta.ausentes
  const porcentajeAfirmativos = total > 0 ? (acta.votosAfirmativos / total) * 100 : 0
  const porcentajeNegativos = total > 0 ? (acta.votosNegativos / total) * 100 : 0
  const porcentajeAbstenciones = total > 0 ? (acta.abstenciones / total) * 100 : 0
  const porcentajeAusentes = total > 0 ? (acta.ausentes / total) * 100 : 0

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
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
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
    <div className="container py-10">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{acta.titulo}</CardTitle>
              <CardDescription>
                Acta N° {acta.numeroActa} - {formatDate(acta.fecha)}
              </CardDescription>
            </div>
            <Badge variant={acta.resultado === "APROBADO" ? "success" : "destructive"} className="text-base py-1 px-3">
              {acta.resultado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalles</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Período:</span>
                  <span className="font-medium">{acta.periodo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reunión:</span>
                  <span className="font-medium">{acta.reunion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Presidente:</span>
                  <span className="font-medium">{acta.presidente}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Resultados</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Afirmativos ({acta.votosAfirmativos})</span>
                    <span>{Math.round(porcentajeAfirmativos)}%</span>
                  </div>
                  <Progress value={porcentajeAfirmativos} className="h-2 bg-muted" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Negativos ({acta.votosNegativos})</span>
                    <span>{Math.round(porcentajeNegativos)}%</span>
                  </div>
                  <Progress value={porcentajeNegativos} className="h-2 bg-muted" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Abstenciones ({acta.abstenciones})</span>
                    <span>{Math.round(porcentajeAbstenciones)}%</span>
                  </div>
                  <Progress value={porcentajeAbstenciones} className="h-2 bg-muted" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Ausentes ({acta.ausentes})</span>
                    <span>{Math.round(porcentajeAusentes)}%</span>
                  </div>
                  <Progress value={porcentajeAusentes} className="h-2 bg-muted" />
                </div>
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
            onRowClick={(voto) => router.push(`/diputados/${voto.diputado}`)}
            emptyMessage="No se encontraron votos para esta acta."
          />
        </CardContent>
      </Card>
    </div>
  )
}

