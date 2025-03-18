"use client"

import {DiputadosGrid} from "@/components/diputados-grid";
import {Diputado} from "@/lib/types";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function DiputadosBloquesPageContent({diputados, bloqueColores}: {
  diputados: Record<string, Diputado[]>,
  bloqueColores: Record<string, string>
}) {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Diputados por Bloque</h1>
        <Link href="/diputados">
          <Button variant="outline">Ver diputados</Button>
        </Link>
      </div>

      <DiputadosGrid diputados={diputados} bloqueColores={bloqueColores}/>
    </div>
  )
}
