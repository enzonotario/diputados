import ActaPageContent from "@/app/actas/[id]/ActaPageContent";
import {getActaById} from "@/lib/api";
import {Metadata} from "next";

export async function generateMetadata({params}): Promise<Metadata> {
  const {id} = params

  const acta = await getActaById(id)

  const title = `Acta ${acta?.titulo} | diputados.argentinadatos.com`

  return {
    title,
    description: "Conoce las actas de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
    openGraph: {
      title,
      description: "Conoce las actas de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
      images: [{
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Acta'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: "Conoce las actas de la Cámara de Diputados de la Nación Argentina. Descubre su historial de votaciones, estadísticas y más.",
      images: ['/og.png']
    }
  }
}

export default function ActaDetailPage({params}) {
  const {id} = params

  return (
    <div className="container flex flex-col py-10 gap-10">
      <ActaPageContent id={id} />
    </div>
  )
}

