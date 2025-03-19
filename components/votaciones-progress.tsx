"use client"

import type React from "react"
import type {Acta} from "@/lib/types"

interface VotacionesProgressProps<T> {
  acta: Acta
  resultado: String
}

export function VotacionesProgress<T>({
  acta,
  resultado,
}: VotacionesProgressProps<T>) {

  return (
      <div className="w-full flex flex-row">
        <div style={{width: `${(acta.votosAfirmativos / acta.votos.length) * 100}%`}}
             className={`h-2 ${resultado === 'afirmativo' ? 'bg-teal-500 dark:bg-teal-400' : 'bg-teal-100 dark:bg-teal-950'}`}
        ></div>
        <div style={{width: `${(acta.votosNegativos / acta.votos.length) * 100}%`}}
             className={`h-2 ${resultado === 'negativo' ? 'bg-red-500 dark:bg-red-400' : 'bg-red-100 dark:bg-red-950'}`}
        ></div>
        <div style={{width: `${(acta.abstenciones / acta.votos.length) * 100}%`}}
             className="h-2 bg-blue-100 dark:bg-blue-950"
        ></div>
        <div style={{width: `${(acta.ausentes / acta.votos.length) * 100}%`}}
             className="h-2 bg-yellow-100 dark:bg-yellow-900"
        ></div>
      </div>
  )
}

