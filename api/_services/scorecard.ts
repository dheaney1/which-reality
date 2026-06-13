const API_KEY = process.env.SCORECARD_API_KEY ?? 'DEMO_KEY'
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json'

const FIELDS = [
  'id',
  'school.name',
  'school.school_url',
  'school.locale',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.completion.rate_suppressed.four_year',
  'latest.student.retention_rate.four_year.full_time',
  'latest.earnings.10_yrs_after_entry.working_not_enrolled.mean_earnings',
].join(',')

function localeToSetting(locale: number | null): string | null {
  if (locale == null) return null
  if (locale >= 11 && locale <= 13) return 'Urban'
  if (locale >= 21 && locale <= 23) return 'Suburban'
  if (locale >= 31 && locale <= 33) return 'Town'
  if (locale >= 41 && locale <= 43) return 'Rural'
  return null
}

export interface ScorecardResult {
  unit_id: number
  name: string
  website: string | null
  setting: string | null
  acceptance_rate: number | null
  avg_sat: number | null
  avg_act: number | null
  tuition_in_state: number | null
  tuition_out_of_state: number | null
  graduation_rate_4yr: number | null
  retention_rate: number | null
  job_placement_rate: number | null
}

type RawResult = Record<string, unknown>

export async function searchColleges(query: string): Promise<ScorecardResult[]> {
  const url = `${BASE_URL}?api_key=${API_KEY}&school.name=${encodeURIComponent(query)}&fields=${FIELDS}&per_page=8`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Scorecard API error ${res.status}`)
  const json = (await res.json()) as { results?: RawResult[] }
  return (json.results ?? []).map((r) => ({
    unit_id: r['id'] as number,
    name: r['school.name'] as string,
    website: (r['school.school_url'] as string | null) ?? null,
    setting: localeToSetting((r['school.locale'] as number | null) ?? null),
    acceptance_rate: (r['latest.admissions.admission_rate.overall'] as number | null) ?? null,
    avg_sat: (r['latest.admissions.sat_scores.average.overall'] as number | null) ?? null,
    avg_act: (r['latest.admissions.act_scores.midpoint.cumulative'] as number | null) ?? null,
    tuition_in_state: (r['latest.cost.tuition.in_state'] as number | null) ?? null,
    tuition_out_of_state: (r['latest.cost.tuition.out_of_state'] as number | null) ?? null,
    graduation_rate_4yr: (r['latest.completion.rate_suppressed.four_year'] as number | null) ?? null,
    retention_rate: (r['latest.student.retention_rate.four_year.full_time'] as number | null) ?? null,
    job_placement_rate: (r['latest.earnings.10_yrs_after_entry.working_not_enrolled.mean_earnings'] as number | null) ?? null,
  }))
}
