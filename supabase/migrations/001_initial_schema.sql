CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_color text NOT NULL
);

CREATE TABLE colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_color text NOT NULL DEFAULT '#4f46e5',
  logo_url text,
  visit_date date,
  tour_guide_names text[] NOT NULL DEFAULT '{}',
  setting text,
  collegeboard_url text,
  official_website_url text,
  description text,
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  other_notes text,
  scorecard_unit_id integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE institutional_metrics (
  college_id uuid PRIMARY KEY REFERENCES colleges(id) ON DELETE CASCADE,
  retention_rate numeric,
  graduation_rate_4yr numeric,
  student_satisfaction_pct numeric,
  job_placement_rate numeric,
  tuition_in_state integer,
  tuition_out_of_state integer,
  dorm_avg_size_sqft numeric
);

CREATE TABLE admissions_data (
  college_id uuid PRIMARY KEY REFERENCES colleges(id) ON DELETE CASCADE,
  acceptance_rate numeric,
  avg_hs_gpa numeric,
  avg_sat integer,
  avg_act integer
);

CREATE TABLE rating_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_custom boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES rating_categories(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, member_id, category_id)
);
