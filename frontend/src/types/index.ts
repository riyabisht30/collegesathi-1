export interface Course {
  id: number;
  name: string;
  short_name: string | null;
  level: string;
  stream: string;
  duration_years: number | null;
}

export interface Exam {
  id: number;
  name: string;
  short_name: string;
  level: string;
  stream: string;
}

export interface Cutoff {
  id: number;
  year: number;
  round_number: number;
  category: string;
  cutoff_score: number | null;
  cutoff_rank: number | null;
  cutoff_percentile: number | null;
}

export interface AdmissionRound {
  id: number;
  round_name: string;
  round_number: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  description: string | null;
}

export interface College {
  id: number;
  name: string;
  short_name: string | null;
  state: string;
  city: string;
  college_type: string;
  nirf_ranking: number | null;
  naac_grade: string | null;
  admission_status: string;
  application_end_date: string | null;
  fee_min: number | null;
  fee_max: number | null;
  total_seats: number | null;
  logo_url: string | null;
  courses: Course[];
  exams_accepted: Exam[];
}

export interface CollegeDetail extends College {
  address: string | null;
  established_year: number | null;
  website: string | null;
  description: string | null;
  application_start_date: string | null;
  application_url: string | null;
  notification_pdf_url: string | null;
  admin_edited_fields: string[];
  cutoffs: Cutoff[];
  admission_rounds: AdmissionRound[];
}

export interface PaginatedResponse {
  colleges: College[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FilterOptions {
  states: string[];
  college_types: string[];
  streams: string[];
  course_levels: string[];
  exams: { short_name: string; name: string }[];
}

export interface QuestionnaireData {
  preferred_states: string[];
  course_level: string;
  streams: string[];
  budget_max: number | null;
  entrance_exams: string[];
  exam_scores: Record<string, number>;
  college_type: string[];
  preferred_city: string | null;
}

export interface User {
  id: number;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}
