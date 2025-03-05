"use client"

import {DiputadosGrid} from "@/components/diputados-grid";

export default function DiputadosBloquesPageContent() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Diputados por Bloque</h1>

      <DiputadosGrid />
    </div>
  )
}
