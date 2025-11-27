export type EnrollmentStatus = 'active' | 'blocked' | 'restricted';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  group_id?: string;
  enrollment_key_used: string;
  status: EnrollmentStatus;
  blocked_at?: string;
  blocked_by?: string;
  reactivated_at?: string;
  enrolled_at: string;
}

export interface EnrollmentWithStudent extends Enrollment {
  student: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    id: string;
    title: string;
    description?: string;
  };
  group?: {
    id: string;
    name: string;
  };
}

