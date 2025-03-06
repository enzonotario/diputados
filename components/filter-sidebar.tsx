"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Badge} from "@/components/ui/badge"
import {X} from "lucide-react"
import type {FilterConfig} from "@/lib/types"

interface FilterOption {
  key: string
  label: string
  type: "text" | "select"
  options?: string[]
}

interface FilterSidebarProps {
  filters: FilterConfig
  onFilterChange: (filters: FilterConfig) => void
  filterOptions: FilterOption[]
  onReset?: () => void
}

export function FilterSidebar({filters, onFilterChange, filterOptions, onReset}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    const updatedFilters = {...localFilters, [key]: value}
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
    setActiveFilter(null)
  }

  const handleReset = () => {
    const emptyFilters = filterOptions.reduce((acc, option) => {
      acc[option.key] = ""
      return acc
    }, {} as FilterConfig)

    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
    if (onReset) onReset()
  }

  const handleRemoveFilter = (key: string) => {
    const updatedFilters = {...localFilters, [key]: ""}
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between flex-wrap">
        <h3 className="font-medium">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <div key={option.key} className="relative">
            <Badge
              variant={localFilters[option.key] ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveFilter(option.key)}
            >
              {option.label}
              {localFilters[option.key] && (
                <X
                  className="h-3 w-3 ml-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFilter(option.key)
                  }}
                />
              )}
            </Badge>

            {activeFilter === option.key && (
              <div className="absolute top-8 left-0 z-10 rounded-lg shadow-lg">
                {option.type === "text" ? (
                  <Input
                    autoFocus
                    value={(localFilters[option.key] as string) || ""}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    placeholder={`Filtrar por ${option.label.toLowerCase()}`}
                  />
                ) : (
                  <Select
                    open={true}
                    onOpenChange={(open) => !open && setActiveFilter(null)}
                    value={(localFilters[option.key] as string) || ""}
                    onValueChange={(value) => handleFilterChange(option.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${option.label.toLowerCase()}`}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {option.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
