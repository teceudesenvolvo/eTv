import axios from 'axios'

const BASE_URL = 'https://www.cmpacatuba.ce.gov.br/dadosabertosexportar'

async function fetchOpenData(params) {
  try {
    const response = await axios.get(BASE_URL, { params })
    return response.data || []
  } catch (error) {
    const query = new URLSearchParams(params).toString()
    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(`${BASE_URL}?${query}`)}`
    const response = await axios.get(proxiedUrl)
    return response.data || []
  }
}

export async function fetchSessoes() {
  const sessions = await fetchOpenData({
    d: 'sessoes',
    a: '',
    f: 'json',
  })
  return sessions.sort((a, b) => (b.Data || '').localeCompare(a.Data || ''))
}

export async function fetchMaterias() {
  return fetchOpenData({
    d: 'materias',
    a: '',
    f: 'json',
  })
}

export async function fetchVereadores() {
  return fetchOpenData({
    d: 'vereadores',
    a: '',
    f: 'json',
  })
}

export async function fetchNoticias() {
  const noticias = await fetchOpenData({
    d: 'noticias',
    a: '',
    f: 'json',
  })
  return noticias.sort((a, b) => (b.Data || b.DataCadastro || '').localeCompare(a.Data || a.DataCadastro || ''))
}

export function materiasForSession(session, materias) {
  if (!session || !session.Data) return []
  return materias.filter(materia => materia.Data === session.Data)
}
