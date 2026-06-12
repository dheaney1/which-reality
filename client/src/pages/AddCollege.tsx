import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { ScorecardResult } from '../types'

export default function AddCollege() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ScorecardResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<ScorecardResult | null>(null)
  const [saving, setSaving] = useState(false)

  const [visitDate, setVisitDate] = useState('')
  const [tourGuides, setTourGuides] = useState('')
  const [description, setDescription] = useState('')
  const [collegeboardUrl, setCollegeboardUrl] = useState('')
  const [brandColor, setBrandColor] = useState('#4f46e5')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(val: string) {
    setQuery(val)
    setSelected(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.colleges.search(val)
        setResults(res)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function pickResult(r: ScorecardResult) {
    setSelected(r)
    setQuery(r.name)
    setResults([])
  }

  function logoUrlFor(website: string | null): string | null {
    if (!website) return null
    try {
      const domain = new URL(
        website.startsWith('http') ? website : `https://${website}`
      ).hostname
      return `https://logo.clearbit.com/${domain}`
    } catch {
      return null
    }
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    try {
      const college = await api.colleges.create({
        scorecard_unit_id: selected.unit_id,
        name: selected.name,
        brand_color: brandColor,
        logo_url: logoUrlFor(selected.website),
        official_website_url: selected.website,
        setting: selected.setting,
        visit_date: visitDate || null,
        tour_guide_names: tourGuides
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        description: description || null,
        collegeboard_url: collegeboardUrl || null,
        acceptance_rate: selected.acceptance_rate,
        avg_sat: selected.avg_sat,
        avg_act: selected.avg_act,
        tuition_in_state: selected.tuition_in_state,
        tuition_out_of_state: selected.tuition_out_of_state,
        graduation_rate_4yr: selected.graduation_rate_4yr,
        retention_rate: selected.retention_rate,
        job_placement_rate: selected.job_placement_rate,
      })
      navigate(`/college/${college.id}`)
    } catch (e) {
      console.error(e)
      alert('Failed to save college. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add a College</h1>

      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search for a school</label>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="e.g. University of Michigan"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searching && (
          <span className="absolute right-3 top-9 text-xs text-gray-400">Searching…</span>
        )}
        {results.length > 0 && !selected && (
          <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((r) => (
              <li key={r.unit_id}>
                <button
                  onClick={() => pickResult(r)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                >
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  {r.setting && <p className="text-xs text-gray-500">{r.setting}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <>
          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-800 mb-3">Auto-filled from College Scorecard</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {selected.acceptance_rate != null && (
                <>
                  <span className="text-gray-500">Acceptance rate</span>
                  <span className="font-medium">{(selected.acceptance_rate * 100).toFixed(1)}%</span>
                </>
              )}
              {selected.tuition_out_of_state != null && (
                <>
                  <span className="text-gray-500">OOS tuition</span>
                  <span className="font-medium">${selected.tuition_out_of_state.toLocaleString()}</span>
                </>
              )}
              {selected.graduation_rate_4yr != null && (
                <>
                  <span className="text-gray-500">4yr grad rate</span>
                  <span className="font-medium">{(selected.graduation_rate_4yr * 100).toFixed(1)}%</span>
                </>
              )}
              {selected.avg_sat != null && (
                <>
                  <span className="text-gray-500">Avg SAT</span>
                  <span className="font-medium">{selected.avg_sat}</span>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-500">{brandColor}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tour Guide Names</label>
            <input
              type="text"
              value={tourGuides}
              onChange={(e) => setTourGuides(e.target.value)}
              placeholder="Alex, Jordan (comma-separated)"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">CollegeBoard URL</label>
            <input
              type="url"
              value={collegeboardUrl}
              onChange={(e) => setCollegeboardUrl(e.target.value)}
              placeholder="https://bigfuture.collegeboard.org/..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="General impressions from the visit…"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save College'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
