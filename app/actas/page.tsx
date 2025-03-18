import ActasPageContent from "@/app/actas/ActasPageContent";
import {Metadata} from "next";
import {getActas} from "@/lib/api";

export const metadata: Metadata = {
  title: "Actas | diputados.argentinadatos.com",
  description: "Descubre las actas de la Cámara de Diputados de la Nación Argentina y cómo votaron los diputados.",
  openGraph: {
    title: "Actas | diputados.argentinadatos.com",
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
    title: "Actas | diputados.argentinadatos.com",
    description: "Descubre las actas de la Cámara de Diputados de la Nación Argentina y cómo votaron los diputados.",
    images: ['/og.png']
  }
}

export default async function ActasPage() {
  const actas = await getActas()

  return (
    <ActasPageContent actas={actas}></ActasPageContent>
  )
}

