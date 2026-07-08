import axios from 'axios'

const BASE_URL = 'https://www.cmpacatuba.ce.gov.br/dadosabertosexportar'

export async function fetchSessoes() {
  const response = await axios.get(BASE_URL, {
    params: {
      d: 'sessoes',
      a: '',
      f: 'json',
    },
  })
  const sessions = response.data || []
  return sessions.sort((a, b) => (b.Data || '').localeCompare(a.Data || ''))
}

export async function fetchMaterias() {
  const response = await axios.get(BASE_URL, {
    params: {
      d: 'materias',
      a: '',
      f: 'json',
    },
  })
  return response.data || []
}

export function materiasForSession(session, materias) {
  if (!session || !session.Data) return []
  return materias.filter(materia => materia.Data === session.Data)
}
