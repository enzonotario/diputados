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
import { CheckCircle, XCircle, Calendar, ArrowRight } from "lucide-react"

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
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Últimas Votaciones</h2>
          <p className="text-muted-foreground">Explora las votaciones más recientes en la Cámara de Diputados</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/actas">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

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
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(acta.fecha)}
                  </CardDescription>
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                    {acta.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"}>
                    {acta.resultado}
                  </Badge>
                </CardContent>

                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col items-center justify-center text-teal-800 dark:text-teal-300">
                        <span>Afirmativos</span>
                        <span>{((acta.votosAfirmativos / acta.votos.length) * 100).toFixed(2)}% ({acta.votosAfirmativos})</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-red-800 dark:text-red-300">
                        <span>Negativos</span>
                        <span>{((acta.votosNegativos / acta.votos.length) * 100).toFixed(2)}% ({acta.votosNegativos})</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-yellow-800 dark:text-yellow-300">
                        <span>Abstenciones</span>
                        <span>{((acta.abstenciones / acta.votos.length) * 100).toFixed(2)}% ({acta.abstenciones})</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-gray-800 dark:text-gray-300">
                        <span>Ausentes</span>
                        <span>{((acta.ausentes / acta.votos.length) * 100).toFixed(2)}% ({acta.ausentes})</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="w-full flex flex-row">
                    <div style={{width: `${(acta.votosAfirmativos / acta.votos.length) * 100}%`}} className="h-2 bg-teal-500 dark:bg-teal-400"></div>
                    <div style={{width: `${(acta.votosNegativos / acta.votos.length) * 100}%`}} className="h-2 bg-red-500 dark:bg-red-400"></div>
                    <div style={{width: `${(acta.abstenciones / acta.votos.length) * 100}%`}} className="h-2 bg-yellow-400 dark:bg-yellow-400"></div>
                    <div style={{width: `${(acta.ausentes / acta.votos.length) * 100}%`}} className="h-2 bg-gray-500 dark:bg-gray-400"></div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
