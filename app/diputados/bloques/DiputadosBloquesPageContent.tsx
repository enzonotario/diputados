"use client"

import {useEffect, useState} from "react"
import {getActas, getDiputados} from "@/lib/api"
import type {Diputado} from "@/lib/types"
import {calcularEstadisticasDiputado} from "@/lib/utils"
import {DiputadosGrid} from "@/components/diputados-grid";
import {Loader2} from "lucide-react";

export default function DiputadosBloquesPageContent() {


  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Diputados por Bloque</h1>

      <DiputadosGrid />
    </div>
  )
}
