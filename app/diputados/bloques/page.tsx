import {Metadata} from "next";
import DiputadosBloquesPageContent from "@/app/diputados/bloques/DiputadosBloquesPageContent";
import {getDiputadosPorBloques} from "@/lib/api";

export const metadata: Metadata = {
  title: "Diputados por Bloque | diputados.argentinadatos.com",
  description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina agrupados por bloque. Descubre su historial de votaciones, estadísticas y más.",
}

export default async function DiputadosBloquesPage() {
  const {diputados, bloqueColores} = await getDiputadosPorBloques()

  return (
    <DiputadosBloquesPageContent diputados={diputados} bloqueColores={bloqueColores}/>
  )
}
