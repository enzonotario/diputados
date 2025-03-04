"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import { useQueryState } from 'nuqs'
import {getActas, getDiputados} from "@/lib/api"
import type {Diputado, FilterConfig, SortConfig} from "@/lib/types"
import {
  calcularEstadisticasDiputado,
  filterDiputados,
  formatDate,
  getUniqueValues,
  isDiputadoActivo,
  sortDiputados
} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {FilterSidebar} from "@/components/filter-sidebar"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {Loader2} from "lucide-react"

export default function DiputadosPageContent() {
  const router = useRouter()
  const [sortKey, setSortKey] = useQueryState('sort', { defaultValue: 'estadisticas.presentismo' })
  const [sortDir, setSortDir] = useQueryState('dir', { defaultValue: 'desc' })
  const [activeTabState, setActiveTabState] = useQueryState('tab', { defaultValue: 'activos' })
  const [provinciaFilter, setProvinciaFilter] = useQueryState('provincia', { defaultValue: '' })
  const [bloqueFilter, setBloqueFilter] = useQueryState('bloque', { defaultValue: '' })
  const [generoFilter, setGeneroFilter] = useQueryState('genero', { defaultValue: '' })
  const [searchQuery, setSearchQuery] = useQueryState('q', { defaultValue: '' })
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getDiputados()
      const actas = await getActas()
      const diputados = data
        .map((diputado) => {
          const actasDiputado = actas.filter(
              (acta) => acta.votos.some((voto) => voto.diputado === `${diputado.apellido}, ${diputado.nombre}`)
              )
          const estadisticas = calcularEstadisticasDiputado(diputado, actasDiputado)
          return { ...diputado, estadisticas, actasDiputado }
        })
        .filter((diputado) => diputado.actasDiputado.length > 0)

      setDiputados(diputados)
      setLoading(false)
    }
    fetchData()
  }, [])

  const sortConfig: SortConfig = { key: sortKey, direction: sortDir as "asc" | "desc" }
  const filters: FilterConfig = {
    ...(provinciaFilter && provinciaFilter !== "all" ? { provincia: provinciaFilter } : {}),
    ...(bloqueFilter && bloqueFilter !== "all" ? { bloque: bloqueFilter } : {}),
    ...(generoFilter && generoFilter !== "all" ? { genero: generoFilter } : {})
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
    { key: "provincia", label: "Provincia", type: "select", options: provincias },
    { key: "bloque", label: "Bloque", type: "select", options: bloques },
    { key: "genero", label: "Género", type: "select", options: generos },
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
      render: (diputado: Diputado) => `${diputado.apellido}, ${diputado.nombre}`,
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
        <Badge variant={diputado.estadisticas.presentismo > 80 ? "teal" : "red"}>
          {diputado.estadisticas.presentismo}%
        </Badge>
      ),
    },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Diputados de Argentina</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="md:col-span-1">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions} />
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTabState} onValueChange={setActiveTabState} className="mb-6">
            <TabsList>
              <TabsTrigger value="activos">Diputados Activos ({activeDiputados.length})</TabsTrigger>
              <TabsTrigger value="inactivos">Diputados Inactivos ({inactiveDiputados.length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
