"use client"

import {useTheme} from "next-themes";
import Link from "next/link";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card, CardContent} from "@/components/ui/card";
import {Loader2} from 'lucide-react';
import {useDiputados} from '@/hooks/use-diputados';
import {Diputado} from "@/lib/types";

export function DiputadosGrid() {
  const {diputados, loading, bloqueColores} = useDiputados();
  const {theme} = useTheme();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  const diputadosPorBloque: Record<string, Diputado[]> = {};
  diputados.forEach(diputado => {
    if (!diputadosPorBloque[diputado.bloque]) {
      diputadosPorBloque[diputado.bloque] = [];
    }
    diputadosPorBloque[diputado.bloque].push(diputado);
  });

  const bloquesOrdenados = Object.keys(diputadosPorBloque).sort(
    (a, b) => diputadosPorBloque[b].length - diputadosPorBloque[a].length
  );

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {bloquesOrdenados.map(bloque => (
        <Card key={bloque} className="overflow-hidden">
          <div
            className="h-2"
            style={{backgroundColor: bloqueColores[bloque]}}
          />
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4 flex-wrap">
              <h3 className="text-lg font-semibold">{bloque}</h3>
              <span className="text-sm text-muted-foreground">
                {diputadosPorBloque[bloque].length} diputados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center">
              {diputadosPorBloque[bloque].map(diputado => (
                <Link
                  href={`/diputados/${diputado.id}`}
                  key={diputado.id}
                  className="flex flex-col items-center group"
                >
                  <Avatar
                    className="size-16 sm:size-10 lg:size-14 xl:size-20 mb-2 transition-transform group-hover:scale-110">
                    <AvatarImage
                      src={diputado.foto || "/placeholder.svg?height=64&width=64"}
                      alt={`${diputado.nombre} ${diputado.apellido}`}
                    />
                    <AvatarFallback className="text-sm">
                      {`${diputado.nombre.charAt(0)}${diputado.apellido.charAt(0)}`}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center truncate max-w-full">
                    {diputado.apellido}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
