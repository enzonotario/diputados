"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getActas } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Acta } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {CheckCircle, XCircle, Calendar, ArrowRight, Users, FileText} from "lucide-react"
import {VotacionesProgress, VotationProgress} from "@/components/votaciones-progress";

export function RecentVotings() {
  const [actas, setActas] = useState<Acta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getActas()
        const sortedActas = data
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 9)
        setActas(sortedActas)
      } catch (error) {
        console.error("Error fetching recent votings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Últimas Votaciones</h2>

        <p className="text-center text-muted-foreground">
            Explora las votaciones más recientes en la Cámara de Diputados
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actas.map((acta) => (
              <Link href={`/actas/${acta.id}`} key={acta.id} className="block group">
                <Card className="h-full overflow-hidden hover:border-gray-500 dark:hover:border-gray-600">
                  <CardHeader className="p-3">
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(acta.fecha)}
                        </div>

                        <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"}>
                          {acta.resultado}
                        </Badge>
                      </div>
                    </CardDescription>
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                      {acta.titulo}
                    </CardTitle>
                  </CardHeader>

                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                      <div className="flex flex-col items-center justify-center text-teal-800 dark:text-teal-300">
                          <span>Afirmativos</span>
                          <span>{((acta.votosAfirmativos / acta.votos.length) * 100).toFixed(0)}% ({acta.votosAfirmativos})</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-red-800 dark:text-red-300">
                          <span>Negativos</span>
                          <span>{((acta.votosNegativos / acta.votos.length) * 100).toFixed(0)}% ({acta.votosNegativos})</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-yellow-800 dark:text-yellow-300">
                          <span>Abstenciones</span>
                          <span>{((acta.abstenciones / acta.votos.length) * 100).toFixed(0)}% ({acta.abstenciones})</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-gray-800 dark:text-gray-300">
                          <span>Ausentes</span>
                          <span>{((acta.ausentes / acta.votos.length) * 100).toFixed(0)}% ({acta.ausentes})</span>
                      </div>
                  </div>

                  <VotacionesProgress acta={acta} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/actas">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Actas</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
