"use client"

import {useTheme} from "next-themes";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Loader2, Users} from 'lucide-react';
import {useDiputados} from '@/hooks/use-diputados';
import {Diputado} from "@/lib/types";
import colors from 'tailwind-colors';

export function DiputadosChart() {
  const {diputados, loading, bloqueColores} = useDiputados();
  const isDark = useTheme().theme === "dark";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  const bloqueConteo: Record<string, number> = {};
  diputados.forEach(d => {
    bloqueConteo[d.bloque] = (bloqueConteo[d.bloque] || 0) + 1;
  });

  const bloquesOrdenados = Object.keys(bloqueConteo).sort(
    (a, b) => bloqueConteo[b] - bloqueConteo[a]
  );

  const width = 1000;
  const height = 500;
  const outerRadius = Math.min(width, height) * 0.8;
  const innerRadius = outerRadius * 0.4;

  const puntos: { x: number; y: number; diputado: Diputado }[] = [];
  const totalDiputados = diputados.length;

  const startAngle = Math.PI;
  const endAngle = 0;

  const numFilas = 5;

  const asientosPorFila = [];
  const totalAsientos = totalDiputados;

  let asientosRestantes = totalAsientos;
  for (let i = 0; i < numFilas; i++) {
    const ratio = (numFilas - i) / ((numFilas * (numFilas + 1)) / 2);
    const asientosEnFila = Math.round(totalAsientos * ratio);
    asientosPorFila.push(Math.min(asientosEnFila, asientosRestantes));
    asientosRestantes -= asientosPorFila[i];
  }

  let asientosAsignados = 0;

  for (let fila = 0; fila < numFilas; fila++) {
    const radioFila = innerRadius + (outerRadius - innerRadius) * (1 - fila / numFilas);
    const asientosEnFila = asientosPorFila[fila];

    for (let pos = 0; pos < asientosEnFila && asientosAsignados < totalDiputados; pos++) {
      const angulo = startAngle - (startAngle - endAngle) * (pos / (asientosEnFila - 1 || 1));

      const x = width / 2 + radioFila * Math.cos(angulo);
      const y = height - 50 - radioFila * Math.sin(angulo);

      if (asientosAsignados < totalDiputados) {
        puntos.push({
          x,
          y,
          diputado: diputados[asientosAsignados]
        });
        asientosAsignados++;
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Diputados de la Nación Argentina</h2>

        <p className="text-center text-muted-foreground">
          {diputados.length} diputados distribuidos en {bloquesOrdenados.length} bloques
        </p>

        <div className="w-full max-w-xl mx-auto flex justify-center overflow-x-auto">
          <svg width={width} height="100%" viewBox={`0 0 ${width} ${height}`}>
            {/* Fondo del semicírculo */}
            <path
              d={`M ${width / 2 - outerRadius} ${height - 50} 
                  A ${outerRadius} ${outerRadius} 0 0 1 ${width / 2 + outerRadius} ${height - 50}
                  L ${width / 2 + innerRadius} ${height - 50}
                  A ${innerRadius} ${innerRadius} 0 0 0 ${width / 2 - innerRadius} ${height - 50}
                  Z`}
              fill={isDark ? colors.gray[800] : colors.gray[200]}
            />

            {/* Dibujar puntos por diputado */}
            {puntos.map((punto, i) => (
              <circle
                key={i}
                cx={punto.x}
                cy={punto.y}
                r={6}
                fill={bloqueColores[punto.diputado.bloque]}
                stroke="#fff"
                strokeWidth={1}
                data-tooltip-content={`${punto.diputado.nombreCompleto} (${punto.diputado.bloque})`}
              />
            ))}
          </svg>
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-wrap justify-start sm:justify-center gap-4 mt-4">
          {bloquesOrdenados.map(bloque => (
            <div key={bloque} className="flex items-center gap-2 sm:text-center">
              <div
                style={{backgroundColor: bloqueColores[bloque]}}
                className="w-4 h-4 rounded-full"
              />
              <span className="text-sm">{bloque} ({bloqueConteo[bloque]})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/diputados">
            <Users className="h-4 w-4"/>
            <span>Ver Diputados</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/diputados/bloques">
            <Users className="h-4 w-4"/>
            <span>Ver Diputados por Bloque</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
