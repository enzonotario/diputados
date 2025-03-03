"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {getActas} from "@/lib/api"
import type {Acta, FilterConfig, SortConfig} from "@/lib/types"
import {filterActas, formatDate, getUniqueValues, getYearsFromActas, sortActas} from "@/lib/utils"
import {DataTable} from "@/components/data-table"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Loader2, Scroll} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";

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
    if (selectedYear && selectedYear !== "todos") {
      const { fechaStart, fechaEnd, ...restFilters } = newFilters
      setFilters({
        ...restFilters,
        fechaStart: selectedYear ? `${selectedYear}-01-01` : null,
        fechaEnd: selectedYear ? `${selectedYear}-12-31` : null,
      })
    } else {
      setFilters(newFilters)
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    if (year && year !== "todos") {
      const yearStart = `${year}-01-01`
      const yearEnd = `${year}-12-31`
      setFilters((prev) => {
        return { ...prev, fechaStart: yearStart, fechaEnd: yearEnd }
      })
    } else {
      const { fechaStart, fechaEnd, ...restFilters } = filters
      setFilters(restFilters)
    }
  }

  const filteredActas = filterActas(actas, filters)
  const sortedActas = sortActas(filteredActas, sortConfig)

  const years = getYearsFromActas(actas)
  const resultados = getUniqueValues(actas, "resultado")

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
        <Badge variant={acta.resultado === "afirmativo" ? "teal" : "red"}>{acta.resultado}</Badge>
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
        <TabsList className="w-full">
          <ScrollArea >
            <div className="flex">
              <TabsTrigger value="todos">Todos los años</TabsTrigger>
              {years.map((year) => (
                <TabsTrigger key={year} value={year}>
                  {year}
                </TabsTrigger>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6">
        <div className="">
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
              searchKeys={["titulo", "resultado"]}
              onRowClick={(acta) => router.push(`/actas/${acta.id}`)}
              emptyMessage="No se encontraron actas con los filtros aplicados."
              additionalFilters={(
                <div className="flex px-2 gap-2">
                  <Select
                    value={filters.resultado || 'all'}
                    onValueChange={(value) => handleFilterChange({ ...filters, resultado: value })}
                  >
                    <SelectTrigger id="resultado">
                      <SelectValue placeholder="Seleccionar resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los resultados</SelectItem>
                      {resultados.map((resultado) => (
                        <SelectItem key={resultado} value={resultado}>
                          {resultado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

