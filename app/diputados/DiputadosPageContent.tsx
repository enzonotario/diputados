"use client"

import {useRouter} from "next/navigation"
import {useQueryState} from 'nuqs'
import type {Diputado, FilterConfig, SortConfig} from "@/lib/types"
import {filterDiputados, formatDate, getUniqueValues, isDiputadoActivo, sortDiputados} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {FilterSidebar} from "@/components/filter-sidebar"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";

export default function DiputadosPageContent({diputados}: {diputados: Diputado[]}) {
  const router = useRouter()
  const [sortKey, setSortKey] = useQueryState('sort', {defaultValue: 'estadisticas.presentismo'})
  const [sortDir, setSortDir] = useQueryState('dir', {defaultValue: 'desc'})
  const [activeTabState, setActiveTabState] = useQueryState('tab', {defaultValue: 'activos'})
  const [provinciaFilter, setProvinciaFilter] = useQueryState('provincia', {defaultValue: ''})
  const [bloqueFilter, setBloqueFilter] = useQueryState('bloque', {defaultValue: ''})
  const [generoFilter, setGeneroFilter] = useQueryState('genero', {defaultValue: ''})
  const [searchQuery, setSearchQuery] = useQueryState('q', {defaultValue: ''})

  const sortConfig: SortConfig = {key: sortKey, direction: sortDir as "asc" | "desc"}
  const filters: FilterConfig = {
    ...(provinciaFilter && provinciaFilter !== "all" ? {provincia: provinciaFilter} : {}),
    ...(bloqueFilter && bloqueFilter !== "all" ? {bloque: bloqueFilter} : {}),
    ...(generoFilter && generoFilter !== "all" ? {genero: generoFilter} : {})
  }

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key)
    setSortDir(direction)
  }

  const handleFilterChange = (newFilters: FilterConfig) => {
    if (newFilters.provincia !== undefined) setProvinciaFilter(newFilters.provincia as string || '')
    if (newFilters.bloque !== undefined) setBloqueFilter(newFilters.bloque as string || '')
    if (newFilters.genero !== undefined) setGeneroFilter(newFilters.genero as string || '')
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const filteredDiputados = filterDiputados(diputados, filters)

  const activeDiputados = filteredDiputados.filter(isDiputadoActivo)
  const inactiveDiputados = filteredDiputados.filter((d) => !isDiputadoActivo(d))

  const sortedActiveDiputados = sortDiputados(activeDiputados, sortConfig)
  const sortedInactiveDiputados = sortDiputados(inactiveDiputados, sortConfig)

  const displayedDiputados = activeTabState === "activos" ? sortedActiveDiputados : sortedInactiveDiputados

  // Obtener valores únicos para los filtros
  const provincias = getUniqueValues(diputados, "provincia")
  const bloques = getUniqueValues(diputados, "bloque")
  const generos = getUniqueValues(diputados, "genero")

  const filterOptions = [
    {key: "provincia", label: "Provincia", type: "select", options: provincias},
    {key: "bloque", label: "Bloque", type: "select", options: bloques},
    {key: "genero", label: "Género", type: "select", options: generos},
  ]

  const columns = [
    {
      key: "foto",
      title: "",
      render: (diputado: Diputado) => (
        <Avatar>
          <AvatarImage
            src={diputado.foto || "/placeholder.svg?height=40&width=40"}
            alt={`${diputado.nombre} ${diputado.apellido}`}
          />
          <AvatarFallback>{`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "apellido",
      title: "Nombre",
      sortable: true,
      render: (diputado: Diputado) => diputado.nombreCompleto,
    },
    {
      key: "provincia",
      title: "Provincia",
      sortable: true,
    },
    {
      key: "bloque",
      title: "Bloque",
      sortable: true,
      render: (diputado: Diputado) => <Badge variant="outline">{diputado.bloque}</Badge>,
    },
    {
      key: "periodoMandato.inicio",
      title: "Inicio Mandato",
      sortable: true,
      render: (diputado: Diputado) => formatDate(diputado.periodoMandato.inicio),
    },
    {
      key: "periodoMandato.fin",
      title: "Fin Mandato",
      sortable: true,
      render: (diputado: Diputado) => formatDate(diputado.periodoMandato.fin),
    },
    {
      key: "estadisticas.presentismo",
      title: "Presentismo",
      sortable: true,
      render: (diputado: Diputado) => (
        <Badge variant={(diputado.estadisticas?.presentismo || 0) > 80 ? "teal" : "red"}>
          {diputado.estadisticas?.presentismo}%
        </Badge>
      ),
    },
  ]

  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Diputados de Argentina</h1>

      <FilterSidebar filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions}/>

      <Tabs value={activeTabState} onValueChange={setActiveTabState}>
        <ScrollArea>
          <div className="flex">
            <TabsList>
              <TabsTrigger value="activos">Diputados Activos ({activeDiputados.length})</TabsTrigger>
              <TabsTrigger value="inactivos">Diputados Inactivos ({inactiveDiputados.length})</TabsTrigger>
            </TabsList>
          </div>
          <ScrollBar orientation="horizontal"/>
        </ScrollArea>
      </Tabs>

      <DataTable
        data={displayedDiputados}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
        onSearchChange={handleSearchChange}
        searchable
        searchKeys={["nombre", "apellido", "provincia", "bloque"]}
        onRowClick={(diputado) => router.push(`/diputados/${diputado.id}`)}
        emptyMessage={`No se encontraron diputados ${activeTabState === "activos" ? "activos" : "inactivos"} con los filtros aplicados.`}
      />
    </div>
  )
}
