import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import ScoreRing from './ScoreRing'
import type { College, FamilyMember, Rating, RatingCategory } from '../types'

interface Props {
  college: College
  activeMember: FamilyMember
  members: FamilyMember[]
}

function scoreStyle(score: number | null): React.CSSProperties {
  if (score == null) return { backgroundColor: '#f9fafb' }
  if (score <= 3) return { backgroundColor: 'rgba(239,68,68,0.12)' }
  if (score <= 6) return { backgroundColor: 'rgba(234,179,8,0.12)' }
  return { backgroundColor: 'rgba(34,197,94,0.12)' }
}

export default function RatingsTab({ college, activeMember, members }: Props) {
  const [categories, setCategories] = useState<RatingCategory[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  useEffect(() => {
    Promise.all([api.categories.list(), api.ratings.forCollege(college.id)])
      .then(([cats, rats]) => { setCategories(cats); setRatings(rats) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [college.id])

  function getScore(memberId: string, categoryId: string): number | null {
    return ratings.find((r) => r.member_id === memberId && r.category_id === categoryId)?.score ?? null
  }

  function handleScoreChange(memberId: string, categoryId: string, score: number) {
    setRatings((prev) => {
      const idx = prev.findIndex((r) => r.member_id === memberId && r.category_id === categoryId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], score }
        return next
      }
      return [
        ...prev,
        { id: 'optimistic', college_id: college.id, member_id: memberId, category_id: categoryId, score, updated_at: '' },
      ]
    })
    api.ratings.upsert({ college_id: college.id, member_id: memberId, category_id: categoryId, score }).catch(console.error)
  }

  function getMemberTotal(memberId: string): number {
    return ratings
      .filter((r) => r.member_id === memberId && categories.some((c) => c.id === r.category_id))
      .reduce((s, r) => s + r.score, 0)
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    setSavingCat(true)
    try {
      const cat = await api.categories.create(newCatName.trim())
      setCategories((prev) => [...prev, cat])
      setNewCatName('')
      setAddingCat(false)
    } catch (e) { console.error(e) }
    finally { setSavingCat(false) }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all scores for this category.`)) return
    await api.categories.delete(id).catch(console.error)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setRatings((prev) => prev.filter((r) => r.category_id !== id))
  }

  const maxScore = categories.length * 10
  const allScores = ratings.filter((r) => categories.some((c) => c.id === r.category_id))
  const familyAvg = allScores.length > 0
    ? allScores.reduce((s, r) => s + r.score, 0) / allScores.length
    : null

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full" style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <th className="text-left pb-3 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                Category
              </th>
              {members.map((m) => {
                const total = getMemberTotal(m.id)
                const fraction = maxScore > 0 ? total / maxScore : 0
                return (
                  <th
                    key={m.id}
                    className={`px-1 pb-3 text-center ${
                      m.id === activeMember.id ? 'bg-indigo-50 rounded-t-xl' : ''
                    }`}
                  >
                    <ScoreRing
                      fraction={fraction}
                      color={m.avatar_color}
                      name={m.name}
                      total={total}
                      max={maxScore}
                    />
                  </th>
                )
              })}
              <th className="px-1 pb-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const catScores = members
                .map((m) => getScore(m.id, cat.id))
                .filter((s): s is number => s != null)
              const catAvg = catScores.length > 0
                ? catScores.reduce((a, b) => a + b, 0) / catScores.length
                : null
              return (
                <tr key={cat.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-700 leading-snug">{cat.name}</span>
                      {cat.is_custom && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-gray-300 hover:text-red-400 transition font-bold text-base leading-none shrink-0"
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                  {members.map((m) => {
                    const score = getScore(m.id, cat.id)
                    return (
                      <td
                        key={m.id}
                        className={`px-1 py-1 text-center ${
                          m.id === activeMember.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={score ?? ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val >= 0 && val <= 10) {
                              handleScoreChange(m.id, cat.id, val)
                            } else if (e.target.value === '') {
                              // allow clearing — don't save blank
                            }
                          }}
                          placeholder="—"
                          className="w-12 text-center rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 border-0"
                          style={scoreStyle(score)}
                        />
                      </td>
                    )
                  })}
                  <td className="px-1 py-1 text-center">
                    <span
                      className="text-sm font-semibold"
                      style={catAvg != null ? { color: catAvg >= 7 ? '#16a34a' : catAvg >= 4 ? '#ca8a04' : '#dc2626' } : { color: '#d1d5db' }}
                    >
                      {catAvg != null ? catAvg.toFixed(1) : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td className="py-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total
              </td>
              {members.map((m) => {
                const total = getMemberTotal(m.id)
                return (
                  <td
                    key={m.id}
                    className={`px-1 py-2 text-center ${
                      m.id === activeMember.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className="text-sm font-bold" style={{ color: m.avatar_color }}>
                      {total}/{maxScore}
                    </span>
                  </td>
                )
              })}
              <td className="px-1 py-2 text-center">
                <span className="text-sm font-bold text-gray-700">
                  {familyAvg != null ? familyAvg.toFixed(1) : '—'}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-5">
        {addingCat ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory()
                if (e.key === 'Escape') { setAddingCat(false); setNewCatName('') }
              }}
              placeholder="e.g. Gender Neutral Bathrooms"
              autoFocus
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddCategory}
              disabled={savingCat || !newCatName.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {savingCat ? '…' : 'Add'}
            </button>
            <button
              onClick={() => { setAddingCat(false); setNewCatName('') }}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingCat(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <span className="text-base leading-none">+</span> Add custom category
          </button>
        )}
      </div>
    </div>
  )
}
