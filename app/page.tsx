import HomePageContent from "@/app/HomePageContent";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "diputados.argentinadatos.com",
  description: "Explora y analiza las votaciones de los proyectos de ley en la Cámara de Diputados de la Nación Argentina.",
  openGraph: {
    title: "diputados.argentinadatos.com",
    description: "Explora y analiza las votaciones de los proyectos de ley en la Cámara de Diputados de la Nación Argentina.",
    images: [{
      url: '/og.png',
      width: 1200,
      height: 630,
      alt: 'Diputados Argentina Datos'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "diputados.argentinadatos.com",
    description: "Explora y analiza las votaciones de los proyectos de ley en la Cámara de Diputados de la Nación Argentina.",
    images: ['/og.png']
  }
}

export default function Home() {
  return (
    <div className="container py-10">
      <HomePageContent />
    </div>
  )
}
