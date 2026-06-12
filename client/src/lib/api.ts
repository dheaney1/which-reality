import type { College, FamilyMember, Rating, RatingCategory, ScorecardResult } from '../types'

// In dev, Vite proxies /api → localhost:3001.
// In production (Vercel), set VITE_API_URL to your Railway backend URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  colleges: {
    list: () => req<College[]>('/colleges'),
    get: (id: string) => req<College>(`/colleges/${id}`),
    search: (q: string) => req<ScorecardResult[]>(`/colleges/search?q=${encodeURIComponent(q)}`),
    create: (data: object) =>
      req<College>('/colleges', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) =>
      req<College>(`/colleges/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      req<{ success: true }>(`/colleges/${id}`, { method: 'DELETE' }),
  },
  members: {
    list: () => req<FamilyMember[]>('/members'),
  },
  categories: {
    list: () => req<RatingCategory[]>('/categories'),
    create: (name: string) =>
      req<RatingCategory>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
    delete: (id: string) =>
      req<{ success: true }>(`/categories/${id}`, { method: 'DELETE' }),
  },
  ratings: {
    forCollege: (collegeId: string) => req<Rating[]>(`/ratings/${collegeId}`),
    upsert: (data: {
      college_id: string
      member_id: string
      category_id: string
      score: number
    }) => req<Rating>('/ratings', { method: 'PUT', body: JSON.stringify(data) }),
  },
}
