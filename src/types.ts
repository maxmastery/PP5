export interface Student {
  id: string;
  studentId: string;
  citizenId?: string;
  name: string;
  targetPercentage?: number;
}

export interface Indicator {
  id: string;
  description: string;
}

export interface ScoreIndicator {
  code: string;
  fullScore: number;
  passingScore: number;
}

export interface ScoreUnit {
  name: string;
  indicators: ScoreIndicator[];
}

export interface ScoreConfig {
  learningArea: string;
  subjectName: string;
  standard: string;
  selectedIndicators: string[];
  units: ScoreUnit[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'admin' | 'user';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Dataset {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  subjectName: string;
  learningArea: string;
  gradeLevel: string;
  status: 'not_started' | 'in_progress' | 'completed';
  deletedAt?: string | null;
  userId?: string;
  data: AppData;
}

export interface AppData {
  generalInfo: {
    gradeLevel: string;
    semester: string;
    academicYear: string;
    subjectCode: string;
    subjectName: string;
    learningArea: string;
    totalHours: string;
    hoursPerWeek: string;
    hoursPerSemester: string;
    teacherName: string;
    teacherName2: string;
    homeroomTeacher1: string;
    homeroomTeacher2: string;
    homeroomTeachers: string;
    headOfLearningArea: string;
    headOfEvaluation: string;
    deputyDirector: string;
    schoolDirector: string;
    approvalDate: string;
  };
  students: Student[];
  attendance: Record<string, any>;
  scores: Record<string, any>;
  scoreConfig?: ScoreConfig;
  attributes: Record<string, any>;
  analytical: Record<string, Record<string, any>>;
  indicators: Indicator[];
}
