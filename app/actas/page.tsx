import ActasPageContent from "@/app/actas/ActasPageContent";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Actas | actas.argentinadatos.com",
  description: "Descubre las actas de la Cámara de Diputados de la Nación Argentina y cómo votaron los diputados.",
  openGraph: {
    title: "Actas | actas.argentinadatos.com",
    description: "Descubre las actas de la Cámara de Diputados de la Nación Argentina y cómo votaron los diputados.",
    images: [{
      url: '/og.png',
      width: 1200,
      height: 630,
      alt: 'Actas'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Actas | actas.argentinadatos.com",
    description: "Descubre las actas de la Cámara de Diputados de la Nación Argentina y cómo votaron los diputados.",
    images: ['/og.png']
  }
}

export default function ActasPage() {

  return (
    <div className="container py-10">
      <ActasPageContent></ActasPageContent>
    </div>
  )
}

