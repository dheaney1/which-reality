import { Link } from 'react-router-dom'
import type { College, FamilyMember } from '../types'

interface Props {
  college: College
  members: FamilyMember[]
}

export default function CollegeCard({ college, members }: Props) {
  const avgScore = college.family_avg_score

  return (
    <Link
      to={`/college/${college.id}`}
      className="block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      <div
        className="h-28 flex items-center justify-center"
        style={{ backgroundColor: college.brand_color }}
      >
        {college.logo_url ? (
          <img
            src={college.logo_url}
            alt={college.name}
            className="h-16 w-auto object-contain drop-shadow-md"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className="text-white text-4xl font-black opacity-40">{college.name[0]}</span>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-gray-900 text-base leading-snug">{college.name}</h2>
        {college.visit_date && (
          <p className="text-xs text-gray-500 mt-0.5">
            Visited{' '}
            {new Date(college.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {members.map((m) => {
              const hasRated = college.member_has_rated?.[m.id] ?? false
              return (
                <span
                  key={m.id}
                  title={m.name}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    backgroundColor: m.avatar_color,
                    opacity: hasRated ? 1 : 0.25,
                  }}
                >
                  {m.name[0]}
                </span>
              )
            })}
          </div>

          {avgScore != null ? (
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: college.brand_color + '30',
                color: college.brand_color,
              }}
            >
              {avgScore.toFixed(1)}
            </span>
          ) : (
            <span className="text-xs text-gray-400">No ratings yet</span>
          )}
        </div>
      </div>
    </Link>
  )
}
