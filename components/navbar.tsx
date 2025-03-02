import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { LandmarkIcon, Users, FileText } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <LandmarkIcon className="h-6 w-6" />
          <Link href="/" className="font-bold">
            Diputados Argentina
          </Link>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/diputados" className="flex items-center gap-1 text-sm font-medium">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Diputados</span>
          </Link>
          <Link href="/actas" className="flex items-center gap-1 text-sm font-medium">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Actas</span>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}

