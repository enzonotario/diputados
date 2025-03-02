"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import type { SortConfig, SortDirection } from "@/lib/types"

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    title: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
  }[]
  onRowClick?: (item: T) => void
  sortConfig?: SortConfig
  onSort?: (key: string, direction: SortDirection) => void
  searchable?: boolean
  searchKeys?: string[]
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  sortConfig,
  onSort,
  searchable = false,
  searchKeys = [],
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData =
    searchable && searchTerm
      ? data.filter((item) => {
          return searchKeys.some((key) => {
            const value = getNestedValue(item, key)
            return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
          })
        })
      : data

  function getNestedValue(obj: any, path: string) {
    const keys = path.split(".")
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj)
  }

  function handleSort(key: string) {
    if (!onSort) return

    const direction: SortDirection = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc"

    onSort(key, direction)
  }

  function renderSortIcon(key: string) {
    if (sortConfig?.key !== key) return null

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <div className="w-full">
      {searchable && (
        <div className="flex items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap">
                  {column.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.title}
                      {renderSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.key}`}>
                      {column.render ? column.render(item) : getNestedValue(item, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

