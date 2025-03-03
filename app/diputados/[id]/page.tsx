import {useParams} from "next/navigation"
import DiputadoPageContent from "@/app/diputados/[id]/DiputadoPageContent";
import {getDiputadoById} from "@/lib/api";

export async function generateMetadata({params}): Promise<Metadata> {
  const {id} = params

  const diputado = await getDiputadoById(id)

  const title = diputado ? `${diputado.nombre} ${diputado.apellido} | diputados.argentinadatos.com` : "Diputado | diputados.argentinadatos.com"

  return {
    title,
    description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
    openGraph: {
      title,
      description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
      images: [{
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Diputado'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: "Conoce a los diputados de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
      images: ['/og.png']
    }
  }
}

export default function DiputadoDetailPage({params}) {
  const {id} = params

  return (
    <div className="container flex flex-col py-10 gap-10">
      <DiputadoPageContent id={id} />
    </div>
  )
}

