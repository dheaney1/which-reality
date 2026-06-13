import { useState } from 'react'
import type { AdmissionsData, College, InstitutionalMetrics } from '../types'

interface Props {
  college: College
  onUpdateMetrics: (data: Partial<InstitutionalMetrics>) => Promise<void>
  onUpdateAdmissions: (data: Partial<AdmissionsData>) => Promise<void>
}

// Percentages stored as 0–1 decimals in DB; display / input as 0–100
function pctDisplay(val: number | null | undefined): string {
  if (val == null) return ''
  return (val * 100).toFixed(1)
}
function pctSave(display: string): number | null {
  const n = parseFloat(display)
  return isNaN(n) ? null : n / 100
}
function numDisplay(val: number | null | undefined): string {
  return val != null ? String(val) : ''
}
function numSave(display: string): number | null {
  const n = parseFloat(display)
  return isNaN(n) ? null : n
}

export default function StatsTab({ college, onUpdateMetrics, onUpdateAdmissions }: Props) {
  const m = college.institutional_metrics
  const a = college.admissions_data

  const [retentionRate, setRetentionRate] = useState(pctDisplay(m?.retention_rate))
  const [gradRate, setGradRate] = useState(pctDisplay(m?.graduation_rate_4yr))
  const [satisfaction, setSatisfaction] = useState(pctDisplay(m?.student_satisfaction_pct))
  const [jobPlacement, setJobPlacement] = useState(pctDisplay(m?.job_placement_rate))
  const [tuitionIn, setTuitionIn] = useState(numDisplay(m?.tuition_in_state))
  const [tuitionOut, setTuitionOut] = useState(numDisplay(m?.tuition_out_of_state))
  const [dormSize, setDormSize] = useState(numDisplay(m?.dorm_avg_size_sqft))

  const [acceptanceRate, setAcceptanceRate] = useState(pctDisplay(a?.acceptance_rate))
  const [avgGpa, setAvgGpa] = useState(numDisplay(a?.avg_hs_gpa))
  const [avgSat, setAvgSat] = useState(numDisplay(a?.avg_sat))
  const [avgAct, setAvgAct] = useState(numDisplay(a?.avg_act))

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Institutional Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatField label="Retention Rate" value={retentionRate} unit="%"
            onChange={setRetentionRate}
            onSave={() => onUpdateMetrics({ retention_rate: pctSave(retentionRate) })} />
          <StatField label="4yr Graduation Rate" value={gradRate} unit="%"
            onChange={setGradRate}
            onSave={() => onUpdateMetrics({ graduation_rate_4yr: pctSave(gradRate) })} />
          <StatField label="Student Satisfaction" value={satisfaction} unit="%"
            onChange={setSatisfaction}
            onSave={() => onUpdateMetrics({ student_satisfaction_pct: pctSave(satisfaction) })} />
          <StatField label="Job Placement Rate" value={jobPlacement} unit="%"
            onChange={setJobPlacement}
            onSave={() => onUpdateMetrics({ job_placement_rate: pctSave(jobPlacement) })} />
          <StatField label="In-State Tuition" value={tuitionIn} unit="$/yr"
            onChange={setTuitionIn}
            onSave={() => onUpdateMetrics({ tuition_in_state: numSave(tuitionIn) != null ? Math.round(numSave(tuitionIn)!) : null })} />
          <StatField label="Out-of-State Tuition" value={tuitionOut} unit="$/yr"
            onChange={setTuitionOut}
            onSave={() => onUpdateMetrics({ tuition_out_of_state: numSave(tuitionOut) != null ? Math.round(numSave(tuitionOut)!) : null })} />
          <StatField label="Avg Dorm Size" value={dormSize} unit="sqft"
            onChange={setDormSize}
            onSave={() => onUpdateMetrics({ dorm_avg_size_sqft: numSave(dormSize) })} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Admissions Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatField label="Acceptance Rate" value={acceptanceRate} unit="%"
            onChange={setAcceptanceRate}
            onSave={() => onUpdateAdmissions({ acceptance_rate: pctSave(acceptanceRate) })} />
          <StatField label="Avg High School GPA" value={avgGpa} unit="/ 4.0"
            onChange={setAvgGpa}
            onSave={() => onUpdateAdmissions({ avg_hs_gpa: numSave(avgGpa) })} />
          <StatField label="Avg SAT" value={avgSat} unit="/ 1600"
            onChange={setAvgSat}
            onSave={() => onUpdateAdmissions({ avg_sat: numSave(avgSat) != null ? Math.round(numSave(avgSat)!) : null })} />
          <StatField label="Avg ACT" value={avgAct} unit="/ 36"
            onChange={setAvgAct}
            onSave={() => onUpdateAdmissions({ avg_act: numSave(avgAct) != null ? Math.round(numSave(avgAct)!) : null })} />
        </div>
      </section>
    </div>
  )
}

function StatField({
  label, value, unit, onChange, onSave,
}: {
  label: string
  value: string
  unit: string
  onChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          step="any"
          placeholder="—"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  )
}
