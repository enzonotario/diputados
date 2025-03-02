"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterConfig } from "@/lib/types"
import { X } from "lucide-react"

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

export function FilterSidebar({ filters, onFilterChange, filterOptions, onReset }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters)

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    const updatedFilters = { ...localFilters, [key]: value }
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
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

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="space-y-4">
        {filterOptions.map((option) => (
          <div key={option.key} className="space-y-2">
            <Label htmlFor={option.key}>{option.label}</Label>

            {option.type === "text" ? (
              <Input
                id={option.key}
                value={(localFilters[option.key] as string) || ""}
                onChange={(e) => handleFilterChange(option.key, e.target.value)}
                placeholder={`Filtrar por ${option.label.toLowerCase()}`}
              />
            ) : (
              <Select
                value={(localFilters[option.key] as string) || ""}
                onValueChange={(value) => handleFilterChange(option.key, value)}
              >
                <SelectTrigger id={option.key}>
                  <SelectValue placeholder={`Seleccionar ${option.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem> {/* Changed default value to "all" */}
                  {option.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

