import Link from "next/link"
import {Button} from "@/components/ui/button"
import {FileText, LandmarkIcon, Users} from "lucide-react"
import {RecentVotings} from "@/components/recent-votings"
import {DiputadosChart} from "@/components/diputados-chart"
import {Separator} from "@/components/ui/separator";

export default function HomePageContent() {
  return (
    <div className="container py-10">
      <section className="flex flex-col items-center justify-center space-y-4 text-center">
        <LandmarkIcon className="h-16 w-16 text-primary"/>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Votaciones de Diputados
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
          Explora y analiza las votaciones de los proyectos de ley en la Cámara de Diputados de la Nación Argentina
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/actas">
              <FileText className="h-4 w-4" />
              <span>Ver Actas</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/diputados">
              <Users className="h-4 w-4" />
              <span>Ver Diputados
              </span>
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="my-20"/>

      <section>
        <DiputadosChart/>
      </section>

      <Separator className="my-20"/>

      <section>
        <RecentVotings/>
      </section>
    </div>
  )
}
