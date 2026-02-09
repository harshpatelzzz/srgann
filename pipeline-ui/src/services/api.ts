import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL,
  timeout: 300_000, // 5 min for large images on CPU
})

export type EnhanceResponse = {
  output_image: string
  scale: number
  time: number
}

export type HealthResponse = {
  status: string
}

export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await api.get<HealthResponse>('/health')
    return data?.status === 'ok'
  } catch {
    return false
  }
}

export async function enhanceImage(file: File, scale: number): Promise<EnhanceResponse> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post<EnhanceResponse>(`/enhance?outscale=${scale}`, formData)
  return data
}
