export interface FamilyMember {
  id: string
  name: string
  avatar_color: string
}

export interface InstitutionalMetrics {
  college_id: string
  retention_rate: number | null
  graduation_rate_4yr: number | null
  student_satisfaction_pct: number | null
  job_placement_rate: number | null
  tuition_in_state: number | null
  tuition_out_of_state: number | null
  dorm_avg_size_sqft: number | null
}

export interface AdmissionsData {
  college_id: string
  acceptance_rate: number | null
  avg_hs_gpa: number | null
  avg_sat: number | null
  avg_act: number | null
}

export interface College {
  id: string
  name: string
  brand_color: string
  logo_url: string | null
  visit_date: string | null
  tour_guide_names: string[]
  setting: string | null
  collegeboard_url: string | null
  official_website_url: string | null
  description: string | null
  pros: string[]
  cons: string[]
  other_notes: string | null
  scorecard_unit_id: number | null
  created_at: string
  family_avg_score?: number | null
  member_has_rated?: Record<string, boolean>
  institutional_metrics?: InstitutionalMetrics | null
  admissions_data?: AdmissionsData | null
}

export interface RatingCategory {
  id: string
  name: string
  is_custom: boolean
  sort_order: number
}

export interface Rating {
  id: string
  college_id: string
  member_id: string
  category_id: string
  score: number
  updated_at: string
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
