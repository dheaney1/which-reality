import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { FamilyMember } from '../types'

interface Props {
  activeMember: FamilyMember
  onChangeProfile: () => void
  children: ReactNode
}

export default function Layout({ activeMember, onChangeProfile, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-700 tracking-tight">
            CampusLog
          </Link>
          <button
            onClick={onChangeProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: activeMember.avatar_color }}
            >
              {activeMember.name[0]}
            </span>
            <span className="text-gray-700">{activeMember.name}</span>
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
