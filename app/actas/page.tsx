"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getActas } from "@/lib/api"
import type { Acta, SortConfig, FilterConfig } from "@/lib/types"
import { sortActas, filterActas, formatDate, getYearsFromActas, getUniqueValues } from "@/lib/utils"
import { DataTable } from "@/components/data-table"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function ActasPage() {
  const router = useRouter()
  const [actas, setActas] = useState<Acta[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "fecha", direction: "desc" })
  const [filters, setFilters] = useState<FilterConfig>({})
  const [selectedYear, setSelectedYear] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getActas()
      setActas(data)
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

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    // Si se selecciona un año, actualizar los filtros para incluir ese año
    if (year) {
      const yearStart = `${year}-01-01`
      const yearEnd = `${year}-12-31`
      setFilters((prev) => ({
        ...prev,
        fechaStart: yearStart,
        fechaEnd: yearEnd,
      }))
    } else {
      // Si se deselecciona el año, eliminar los filtros de fecha
      const { fechaStart, fechaEnd, ...restFilters } = filters
      setFilters(restFilters)
    }
  }

  // Filtrar y ordenar actas
  const filteredActas = filterActas(actas, filters)
  const sortedActas = sortActas(filteredActas, sortConfig)

  // Obtener años disponibles para el filtro
  const years = getYearsFromActas(actas)

  // Obtener valores únicos para los filtros
  const periodos = getUniqueValues(actas, "periodo")
  const resultados = getUniqueValues(actas, "resultado")
  const presidentes = getUniqueValues(actas, "presidente")

  const filterOptions = [
    { key: "titulo", label: "Título", type: "text" },
    { key: "periodo", label: "Período", type: "select", options: periodos },
    { key: "resultado", label: "Resultado", type: "select", options: resultados },
    { key: "presidente", label: "Presidente", type: "select", options: presidentes },
  ]

  const columns = [
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
        <Badge variant={acta.resultado === "APROBADO" ? "success" : "destructive"}>{acta.resultado}</Badge>
      ),
    },
    {
      key: "votosAfirmativos",
      title: "Afirmativos",
      sortable: true,
    },
    {
      key: "votosNegativos",
      title: "Negativos",
      sortable: true,
    },
    {
      key: "abstenciones",
      title: "Abstenciones",
      sortable: true,
    },
    {
      key: "ausentes",
      title: "Ausentes",
      sortable: true,
    },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Actas de Votación</h1>

      <Tabs value={selectedYear || "todos"} onValueChange={handleYearChange} className="mb-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="todos">Todos los años</TabsTrigger>
          {years.map((year) => (
            <TabsTrigger key={year} value={year}>
              {year}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions} />
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              data={sortedActas}
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              searchable
              searchKeys={["titulo", "resultado", "presidente"]}
              onRowClick={(acta) => router.push(`/actas/${acta.id}`)}
              emptyMessage="No se encontraron actas con los filtros aplicados."
            />
          )}
        </div>
      </div>
    </div>
  )
}

