"use client"

import type React from "react"
import type {Acta} from "@/lib/types"

interface VotacionesProgressProps<T> {
  acta: Acta
}

export function VotacionesProgress<T>({
    acta,
}: VotacionesProgressProps<T>) {
  return (
      <div className="w-full flex flex-row">
        <div style={{width: `${(acta.votosAfirmativos / acta.votos.length) * 100}%`}} className="h-2 bg-teal-500 dark:bg-teal-400"></div>
        <div style={{width: `${(acta.votosNegativos / acta.votos.length) * 100}%`}} className="h-2 bg-red-500 dark:bg-red-400"></div>
        <div style={{width: `${(acta.abstenciones / acta.votos.length) * 100}%`}} className="h-2 bg-yellow-400 dark:bg-yellow-400"></div>
        <div style={{width: `${(acta.ausentes / acta.votos.length) * 100}%`}} className="h-2 bg-gray-500 dark:bg-gray-400"></div>
      </div>
  )
}

