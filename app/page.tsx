import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LandmarkIcon, Users, FileText, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="container py-10">
      <section className="flex flex-col items-center justify-center space-y-4 text-center py-10 md:py-16">
        <LandmarkIcon className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Análisis de Diputados Argentinos
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
          Explora datos sobre los diputados de Argentina, sus votaciones, asistencia y más.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/diputados">Ver Diputados</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/actas">Ver Actas</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-10">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Diputados en Función</CardTitle>
            <CardDescription>Información detallada sobre los diputados actualmente en función.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Consulta datos personales, períodos de mandato, bloques políticos y más.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/diputados">Explorar Diputados</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Actas y Votaciones</CardTitle>
            <CardDescription>Registro de todas las actas y votaciones realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accede a información sobre las votaciones, resultados y participación de cada diputado.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/actas">Ver Actas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Análisis estadístico del desempeño de los diputados.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualiza datos sobre presentismo, tendencias de voto y comportamiento por bloque.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/diputados">Ver Estadísticas</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="py-10">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-bold mb-4">Sobre esta plataforma</h2>
          <p className="text-muted-foreground mb-4">
            Esta plataforma utiliza datos públicos de la Cámara de Diputados de Argentina para ofrecer una visión
            transparente y accesible del trabajo legislativo. Los datos son obtenidos a través de APIs públicas y se
            actualizan regularmente.
          </p>
          <p className="text-muted-foreground">
            El objetivo es facilitar el acceso a la información pública y promover la transparencia en el funcionamiento
            del poder legislativo argentino.
          </p>
        </div>
      </section>
    </div>
  )
}

