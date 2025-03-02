import type { Diputado, Acta } from "@/lib/types"

const API_BASE_URL = "https://api.argentinadatos.com/v1/diputados"

export async function getDiputados(): Promise<Diputado[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/diputados`)
    if (!response.ok) {
      throw new Error(`Error fetching diputados: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching diputados:", error)
    return []
  }
}

export async function getDiputadoById(id: string): Promise<Diputado | null> {
  try {
    const diputados = await getDiputados()
    return diputados.find((diputado) => diputado.id === id) || null
  } catch (error) {
    console.error(`Error fetching diputado with id ${id}:`, error)
    return null
  }
}

export async function getActas(): Promise<Acta[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/actas`)
    if (!response.ok) {
      throw new Error(`Error fetching actas: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching actas:", error)
    return []
  }
}

export async function getActasByYear(year: string): Promise<Acta[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/actas/${year}`)
    if (!response.ok) {
      throw new Error(`Error fetching actas for year ${year}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching actas for year ${year}:`, error)
    return []
  }
}

export async function getActaById(id: string): Promise<Acta | null> {
  try {
    const actas = await getActas()
    return actas.find((acta) => acta.id === id) || null
  } catch (error) {
    console.error(`Error fetching acta with id ${id}:`, error)
    return null
  }
}

