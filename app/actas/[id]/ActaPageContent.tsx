"use client"

import {useRouter} from "next/navigation"
import type {Acta, Diputado, FilterConfig, SortConfig, Voto} from "@/lib/types"
import {filterDiputados, formatDate, getUniqueValues, sortDiputados} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle, MinusCircle, User, XCircle} from "lucide-react"
import {Progress} from "@/components/ui/progress";
import {VotacionesProgress} from "@/components/votaciones-progress";
import {FilterSidebar} from "@/components/filter-sidebar";
import {useQueryState} from "nuqs";

export default function ActaPageContent({acta}: { acta: Acta | null }) {
  const router = useRouter()
  const [sortKey, setSortKey] = useQueryState('sort', {defaultValue: ''})
  const [sortDir, setSortDir] = useQueryState('dir', {defaultValue: ''})
  const [searchQuery, setSearchQuery] = useQueryState('q', {defaultValue: ""})
  const [bloqueFilter, setBloqueFilter] = useQueryState('bloque', {defaultValue: ""})
  const [provinciaFilter, setProvinciaFilter] = useQueryState('provincia', {defaultValue: ""})
  const [tipoVotoFilter, setTipoVotoFilter] = useQueryState('tipoVoto', {defaultValue: ""})

  const sortConfig: SortConfig = {key: sortKey, direction: sortDir as "asc" | "desc"}

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key)
    setSortDir(direction)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  if (!acta) {
    return (
      <div className="page-container">
        <Card>
          <CardHeader>
            <CardTitle>Acta no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar información para el acta solicitada.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const filters: FilterConfig = {
    ...(searchQuery ? {nombreCompleto: searchQuery} : {}),
    ...(bloqueFilter ? {bloque: bloqueFilter} : {}),
    ...(provinciaFilter ? {provincia: provinciaFilter} : {}),
    ...(tipoVotoFilter ? {tipoVoto: tipoVotoFilter} : {}),
  }

  const diputados = acta.votos.map((voto: Voto) => voto.diputadoObj) as Diputado[]
  const filteredDiputados = filterDiputados(diputados, filters)
  const diputadosSorted = sortDiputados(filteredDiputados, sortConfig)

  const filterOptions = [
    {key: "bloque", label: "Bloque", type: "select", options: getUniqueValues(diputados, "bloque")},
    {key: "provincia", label: "Provincia", type: "select", options: getUniqueValues(diputados, "provincia")},
    {key: "tipoVoto", label: "Tipo de Voto", type: "select", options: getUniqueValues(diputados, "tipoVoto")},
  ]

  const handleFilterChange = (newFilters: FilterConfig) => {
    if (newFilters.bloque !== undefined) setBloqueFilter(newFilters.bloque || "")
    if (newFilters.provincia !== undefined) setProvinciaFilter(newFilters.provincia || "")
    if (newFilters.tipoVoto !== undefined) setTipoVotoFilter(newFilters.tipoVoto || "")
  }

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
      render: (diputado: any) => (
        <Avatar>
          <AvatarImage src={diputado.foto || "/placeholder.svg?height=40&width=40"} alt={diputado.nombreCompleto}/>
          <AvatarFallback>{diputado.nombreCompleto?.substring(0, 2)}</AvatarFallback>
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
                <CheckCircle className="h-5 w-5 text-teal-500"/>
                <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Afirmativo</span>
              </div>
            )
          case "negativo":
            return (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500"/>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Negativo</span>
              </div>
            )
          case "abstencion":
            return (
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-blue-500"/>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Abstención</span>
              </div>
            )
          case "ausente":
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground"/>
                <span className="text-sm font-medium text-muted-foreground">Ausente</span>
              </div>
            )
          default:
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground"/>
                <span className="text-sm font-medium text-muted-foreground">{voto.tipoVoto}</span>
              </div>
            )
        }
      },
    },
  ]

  return (
    <div className="page-container relative flex flex-col gap-10">
      <Card className="md:sticky md:top-16 z-10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <CardTitle className="text-lg md:text-2xl">{acta.titulo}</CardTitle>
            </div>
            <div className="flex flex-col justify-center items-center gap-0.5">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"}
                     className="text-base py-1 px-3 capitalize">
                {acta.resultado}
              </Badge>
            </div>
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
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">Ausentes</p>
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
            <Progress value={presentismo} className="h-2 rounded-t-none"/>
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
                  <span
                    className="text-xl md:text-3xl font-bold text-teal-700 dark:text-teal-400">{votosAfirmativos}</span>
                  <p className="text-sm text-gray-500">Afirmativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span className="text-xl md:text-3xl font-bold text-red-700 dark:text-red-400">{votosNegativos}</span>
                  <p className="text-sm text-gray-500">Negativos</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <span
                    className="text-xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">{abstenciones}</span>
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
                    className="size-3 md:size-4 text-blue-500 dark:text-blue-400"
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex-1"></div>
          <VotacionesProgress acta={acta} resultado={acta.resultado}/>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votos de los Diputados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions}/>

          <DataTable
            data={diputadosSorted}
            columns={columnasVotos}
            searchable
            searchKeys={["nombreCompleto", "bloque", "provincia", "tipoVoto"]}
            onSearchChange={handleSearchChange}
            onRowClick={(diputado) => router.push(`/diputados/${diputado.id}`)}
            emptyMessage="No se encontraron votos para esta acta."
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  )
}
