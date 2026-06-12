import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import CollegeCard from '../components/CollegeCard'
import type { College, FamilyMember } from '../types'

type SortKey = 'date' | 'name' | 'score'

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [sort, setSort] = useState<SortKey>('date')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.colleges.list(), api.members.list()])
      .then(([c, m]) => {
        setColleges(c)
        setMembers(m)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...colleges].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'score') return (b.family_avg_score ?? -1) - (a.family_avg_score ?? -1)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colleges</h1>
          <p className="text-sm text-gray-500 mt-0.5">{colleges.length} visited</p>
        </div>
        <Link
          to="/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          + Add College
        </Link>
      </div>

      {colleges.length > 0 && (
        <div className="flex gap-2 mb-5">
          {(['date', 'name', 'score'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                sort === k
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {k === 'date' ? 'Visit Date' : k === 'name' ? 'Name' : 'Avg Score'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-48" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">&#127979;</p>
          <p className="text-gray-500 text-lg font-medium">No colleges added yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first campus visit to get started</p>
          <Link
            to="/add"
            className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Add First College
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c) => (
            <CollegeCard key={c.id} college={c} members={members} />
          ))}
        </div>
      )}
    </div>
  )
}
