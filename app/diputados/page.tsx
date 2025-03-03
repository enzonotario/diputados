"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
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

export default function DiputadosPage() {
  const router = useRouter()
  const [diputados, setDiputados] = useState<Diputado[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "apellido", direction: "asc" })
  const [filters, setFilters] = useState<FilterConfig>({})
  const [activeTab, setActiveTab] = useState<string>("activos")

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

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction })
  }

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters)
  }

  const filteredDiputados = filterDiputados(diputados, filters)

  const activeDiputados = filteredDiputados.filter(isDiputadoActivo)
  const inactiveDiputados = filteredDiputados.filter((d) => !isDiputadoActivo(d))

  const sortedActiveDiputados = sortDiputados(activeDiputados, sortConfig)
  const sortedInactiveDiputados = sortDiputados(inactiveDiputados, sortConfig)

  const displayedDiputados = activeTab === "activos" ? sortedActiveDiputados : sortedInactiveDiputados

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
      title: "Apellido y Nombre",
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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
              searchable
              searchKeys={["nombre", "apellido", "provincia", "bloque"]}
              onRowClick={(diputado) => router.push(`/diputados/${diputado.id}`)}
              emptyMessage={`No se encontraron diputados ${activeTab === "activos" ? "activos" : "inactivos"} con los filtros aplicados.`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

