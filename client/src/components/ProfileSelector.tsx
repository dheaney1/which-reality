import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { FamilyMember } from '../types'

interface Props {
  onSelect: (member: FamilyMember) => void
}

export default function ProfileSelector({ onSelect }: Props) {
  const [members, setMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    api.members.list().then(setMembers).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold tracking-tight">CampusLog</h1>
        <p className="text-gray-400 mt-2">Who's browsing?</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-900 hover:bg-gray-800 transition"
          >
            <span
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: m.avatar_color }}
            >
              {m.name[0]}
            </span>
            <span className="text-white font-medium">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
