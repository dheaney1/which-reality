import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import NotesTab from '../components/NotesTab'
import RatingsTab from '../components/RatingsTab'
import StatsTab from '../components/StatsTab'
import type { AdmissionsData, College, FamilyMember, InstitutionalMetrics } from '../types'

type Tab = 'overview' | 'notes' | 'ratings' | 'stats'

interface Props {
  activeMember: FamilyMember
}

const INPUT_CLS =
  'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function CollegeDetail({ activeMember }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [college, setCollege] = useState<College | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([api.colleges.get(id), api.members.list()])
      .then(([c, m]) => { setCollege(c); setMembers(m) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function updateField(field: string, value: unknown) {
    if (!college) return
    const updated = await api.colleges.update(college.id, { [field]: value })
    setCollege((prev) => prev ? { ...prev, ...updated } : prev)
  }

  async function updateMetrics(data: Partial<InstitutionalMetrics>) {
    if (!college) return
    const updated = await api.metrics.update(college.id, data)
    setCollege((prev) => prev ? { ...prev, institutional_metrics: updated } : prev)
  }

  async function updateAdmissions(data: Partial<AdmissionsData>) {
    if (!college) return
    const updated = await api.admissions.update(college.id, data)
    setCollege((prev) => prev ? { ...prev, admissions_data: updated } : prev)
  }

  async function handleDelete() {
    if (!college) return
    if (!confirm(`Delete ${college.name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.colleges.delete(college.id)
      navigate('/')
    } catch {
      alert('Failed to delete college.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-2xl bg-gray-200" />
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    )
  }

  if (!college) return <p className="text-gray-500">College not found.</p>

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'notes', label: 'Notes' },
    { key: 'ratings', label: 'Ratings' },
    { key: 'stats', label: 'Stats' },
  ]

  return (
    <div>
      <div
        className="rounded-2xl h-32 flex items-center justify-center mb-4"
        style={{ backgroundColor: college.brand_color }}
      >
        {college.logo_url ? (
          <img
            src={college.logo_url}
            alt={college.name}
            className="h-20 w-auto object-contain drop-shadow-md"
            onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span className="text-white text-5xl font-black opacity-40">{college.name[0]}</span>
        )}
      </div>

      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
          {college.visit_date && (
            <p className="text-sm text-gray-500">
              Visited{' '}
              {new Date(college.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6 -mx-4 px-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab college={college} onUpdate={updateField} />}
      {tab === 'notes' && <NotesTab college={college} onUpdate={updateField} />}
      {tab === 'ratings' && (
        <RatingsTab college={college} activeMember={activeMember} members={members} />
      )}
      {tab === 'stats' && (
        <StatsTab
          college={college}
          onUpdateMetrics={updateMetrics}
          onUpdateAdmissions={updateAdmissions}
        />
      )}
    </div>
  )
}

function OverviewTab({
  college,
  onUpdate,
}: {
  college: College
  onUpdate: (field: string, value: unknown) => Promise<void>
}) {
  const [description, setDescription] = useState(college.description ?? '')
  const [tourGuides, setTourGuides] = useState(college.tour_guide_names.join(', '))
  const [visitDate, setVisitDate] = useState(college.visit_date ?? '')

  return (
    <div className="space-y-5">
      {college.setting && (
        <span className="inline-block text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
          {college.setting}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {college.official_website_url && (
          <a
            href={
              college.official_website_url.startsWith('http')
                ? college.official_website_url
                : `https://${college.official_website_url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full transition"
          >
            Official Website
          </a>
        )}
        {college.collegeboard_url && (
          <a
            href={college.collegeboard_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full transition"
          >
            CollegeBoard
          </a>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Visit Date</label>
        <input type="date" value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          onBlur={() => onUpdate('visit_date', visitDate || null)}
          className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tour Guides</label>
        <input type="text" value={tourGuides}
          onChange={(e) => setTourGuides(e.target.value)}
          onBlur={() =>
            onUpdate('tour_guide_names', tourGuides.split(',').map((s) => s.trim()).filter(Boolean))
          }
          placeholder="Names of tour guides"
          className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
        <textarea value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => onUpdate('description', description || null)}
          rows={4}
          placeholder="General impressions from the visit…"
          className={`${INPUT_CLS} resize-none`} />
      </div>
    </div>
  )
}
