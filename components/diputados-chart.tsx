"use client"

import {useTheme} from "next-themes";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Users} from 'lucide-react';
import {Diputado} from "@/lib/types";
import colors from "tailwind-colors";

export function DiputadosChart({diputados, bloqueColores}: {diputados: Diputado[], bloqueColores: Record<string, string>}) {
  const isDark = useTheme().theme === "dark";

  const bloqueConteo: Record<string, number> = {};
  diputados.forEach(d => {
    bloqueConteo[d.bloque] = (bloqueConteo[d.bloque] || 0) + 1;
  });

  const bloquesOrdenados = Object.keys(bloqueConteo).sort(
    (a, b) => bloqueConteo[b] - bloqueConteo[a]
  );

  const width = 1000;
  const height = 400;
  const outerRadius = 450;
  const innerRadius = 200;

  const puntos: { x: number; y: number; diputado: Diputado }[] = [];
  const totalDiputados = diputados.length;

  const startAngle = Math.PI;
  const endAngle = 0;
  const centerX = width / 2;
  const centerY = height;

  const bloquePositionMap: Record<string, number> = {};

  bloquesOrdenados.forEach((bloque, index) => {
    bloquePositionMap[bloque] = 10 + (80 * (index + 1)) / (bloquesOrdenados.length + 1);
  });

  const sortedDiputados = [...diputados].sort((a, b) => {
    const posA = bloquePositionMap[a.bloque] || 50;
    const posB = bloquePositionMap[b.bloque] || 50;
    return posA - posB;
  });

  const numRows = 8; // Number of concentric rows

  // Calculate how many seats per row, with more seats in outer rows
  const seatsPerRow = [];
  let remainingSeats = totalDiputados;

  for (let row = 0; row < numRows; row++) {
    // Outer rows have more seats proportional to their circumference
    const rowRadius = innerRadius + (outerRadius - innerRadius) * (row / (numRows - 1));
    const proportion = rowRadius / innerRadius;

    // Calculate approximate seats for this row
    let rowSeats = Math.floor(totalDiputados * proportion / (numRows * proportion));

    // Ensure we don't allocate more seats than remaining
    rowSeats = Math.min(rowSeats, remainingSeats);
    seatsPerRow.push(rowSeats);
    remainingSeats -= rowSeats;
  }

  // If we have any remaining seats, add them to the outer rows
  let currentRow = numRows - 1;
  while (remainingSeats > 0 && currentRow >= 0) {
    seatsPerRow[currentRow]++;
    remainingSeats--;
    currentRow--;
  }

  // Now distribute the sorted diputados across the rows
  let diputadoIndex = 0;

  for (let row = 0; row < numRows; row++) {
    const rowRadius = innerRadius + (outerRadius - innerRadius) * (row / (numRows - 1));
    const seatsInThisRow = seatsPerRow[row];

    for (let seat = 0; seat < seatsInThisRow && diputadoIndex < totalDiputados; seat++) {
      // Calculate angle based on position in this row
      const angle = startAngle - (seat * (startAngle - endAngle) / (seatsInThisRow - 1 || 1));

      // Calculate x,y coordinates
      const x = centerX + rowRadius * Math.cos(angle);
      const y = centerY - rowRadius * Math.sin(angle);

      puntos.push({
        x,
        y,
        diputado: sortedDiputados[diputadoIndex]
      });

      diputadoIndex++;
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Diputados de la Nación Argentina</h2>

      <p className="text-center text-muted-foreground">
        {diputados.length} diputados distribuidos en {bloquesOrdenados.length} bloques
      </p>

      <div className="w-full max-w-xl mx-auto flex justify-center overflow-x-auto">
        <svg width={width} height={height - 100} viewBox={`0 0 ${width} ${height}`}>
          {/* Fondo del semicírculo */}
          <path
            d={`M ${centerX - outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY}
                L ${centerX + innerRadius} ${centerY}
                A ${innerRadius} ${innerRadius} 0 0 0 ${centerX - innerRadius} ${centerY}
                Z`}
            fill={isDark ? colors.gray[800] : colors.gray[300]}
          />

          {/* Dibujar puntos por diputado */}
          {puntos.map((punto, i) => (
            <circle
              key={i}
              cx={punto.x}
              cy={punto.y}
              r={10}
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
