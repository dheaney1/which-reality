import { useState } from 'react'
import type { College } from '../types'

interface Props {
  college: College
  onUpdate: (field: string, value: unknown) => Promise<void>
}

export default function NotesTab({ college, onUpdate }: Props) {
  const [pros, setPros] = useState(college.pros.join('\n'))
  const [cons, setCons] = useState(college.cons.join('\n'))
  const [other, setOther] = useState(college.other_notes ?? '')

  return (
    <div className="space-y-6">
      <NoteSection
        label="Pros"
        color="text-green-700"
        bg="bg-green-50"
        border="border-green-200"
        value={pros}
        onChange={setPros}
        onSave={() =>
          onUpdate('pros', pros.split('\n').map((s) => s.trim()).filter(Boolean))
        }
        placeholder="One pro per line…"
      />
      <NoteSection
        label="Cons"
        color="text-red-700"
        bg="bg-red-50"
        border="border-red-200"
        value={cons}
        onChange={setCons}
        onSave={() =>
          onUpdate('cons', cons.split('\n').map((s) => s.trim()).filter(Boolean))
        }
        placeholder="One con per line…"
      />
      <NoteSection
        label="Other Notes"
        color="text-gray-700"
        bg="bg-gray-50"
        border="border-gray-200"
        value={other}
        onChange={setOther}
        onSave={() => onUpdate('other_notes', other || null)}
        placeholder="Anything else to remember…"
      />
    </div>
  )
}

function NoteSection({
  label, color, bg, border, value, onChange, onSave, placeholder,
}: {
  label: string
  color: string
  bg: string
  border: string
  value: string
  onChange: (v: string) => void
  onSave: () => void
  placeholder: string
}) {
  const lines = value.split('\n').map((s) => s.trim()).filter(Boolean)

  return (
    <div>
      <div className={`rounded-xl p-4 ${bg} border ${border}`}>
        <h3 className={`text-sm font-semibold mb-3 ${color}`}>{label}</h3>
        {lines.length > 0 && (
          <ul className="mb-3 space-y-1">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0">&#8226;</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>
    </div>
  )
}
