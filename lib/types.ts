export interface Diputado {
  id: string
  nombre: string
  apellido: string
  genero: string
  provincia: string
  periodoMandato: {
    inicio: string
    fin: string
  }
  juramentoFecha: string
  ceseFecha: string | null
  bloque: string
  periodoBloque: {
    inicio: string
    fin: string
  }
  foto: string
}

export interface Voto {
  diputado: string
  tipoVoto: string
  imagen: string
  videoDiscurso: string
}

export interface Acta {
  id: string
  periodo: string
  reunion: string
  numeroActa: string
  titulo: string
  resultado: string
  fecha: string
  presidente: string
  votosAfirmativos: number
  votosNegativos: number
  abstenciones: number
  ausentes: number
  votos: Voto[]
}

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface FilterConfig {
  [key: string]: string
}

