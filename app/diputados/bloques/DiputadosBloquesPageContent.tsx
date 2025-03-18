"use client"

import {DiputadosGrid} from "@/components/diputados-grid";
import {Diputado} from "@/lib/types";

export default function DiputadosBloquesPageContent({diputados, bloqueColores}: {
  diputados: Record<string, Diputado[]>,
  bloqueColores: Record<string, string>
}) {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-6">Diputados por Bloque</h1>

      <DiputadosGrid diputados={diputados} bloqueColores={bloqueColores}/>
    </div>
  )
}
