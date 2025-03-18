import DiputadosPageContent from "@/app/diputados/DiputadosPageContent";
import {Metadata} from "next";
import {getDiputadosConActas} from "@/lib/api";

export const metadata: Metadata = {
  title: "Diputados | diputados.argentinadatos.com",
  description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
  openGraph: {
    title: "Diputados | diputados.argentinadatos.com",
    description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
    images: [{
      url: '/og.png',
      width: 1200,
      height: 630,
      alt: 'Diputados'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Diputados | diputados.argentinadatos.com",
    description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
    images: ['/og.png']
  }
}

export default async function DiputadosPage() {
  const diputados = await getDiputadosConActas()
  return (
    <DiputadosPageContent diputados={diputados}/>
  )
}

