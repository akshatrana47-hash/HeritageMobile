import type {
  LessonPlan, UserAccount, CompetencyDef, CompetencyAssessment, SectionBadge, LogEntry, ContentRepository, ScheduleChangeRequest, CourseEvaluation,
  HistoricalOffering, Faculty, ProgramType, AcademicProgram, Term, BadgeBase, FacultyRecord, TodoItem, InstructorProfile, Course, Section,
} from '../../domain/types';
import type { SectionWithCourse } from './academics';

export interface DashboardData {
  studentCount: number;
  courseCount: number;
  sectionCount: number;
  pendingGradeSections: number;
  todos: TodoItem[];
  sections: (SectionWithCourse & { gradeStatus: 'Submission required' | 'Submitted' | 'Released' })[];
  officeHours: { label: string; roomReady: boolean };
  unreadNotifications: number;
}

export interface InstructorService {
  dashboard(instructorId: string): Promise<DashboardData>;
  completeTodo(todoId: string): Promise<void>;
  // Student directory (restricted to authorised fixture records)
  listStudents(instructorId: string, filters: { category: 'all' | 'active' | 'former'; query?: string; letter?: string; page: number; pageSize: number; program?: string }): Promise<{ items: (UserAccount & { status: string; termLabel: string; admissionTerm: string; updatedAt: string })[]; total: number; pageCount: number }>;
  getStudent(instructorId: string, studentId: string): Promise<UserAccount & { sections: SectionWithCourse[] }>;
  // Lesson plans
  listLessonCourses(instructorId: string): Promise<Course[]>;
  listLessonPlans(courseId: string): Promise<LessonPlan[]>;
  getLessonPlan(lessonId: string): Promise<LessonPlan>;
  saveLessonPlan(lesson: LessonPlan): Promise<LessonPlan>;
  generateLessonDraft(lessonId: string, kind: 'lesson' | 'quiz'): Promise<{ content: string }>;
  publishLessonPlan(lessonId: string): Promise<LessonPlan>;
  // Workspace tabs
  listCompetencies(sectionId: string): Promise<(CompetencyDef & { assessments: CompetencyAssessment[] })[]>;
  saveCompetency(def: Omit<CompetencyDef, 'id'> & { id?: string }): Promise<CompetencyDef>;
  deleteCompetency(id: string): Promise<void>;
  assessCompetency(input: { competencyId: string; studentId: string; level: string }): Promise<CompetencyAssessment>;
  listSectionBadges(sectionId: string): Promise<SectionBadge[]>;
  saveSectionBadge(badge: Omit<SectionBadge, 'id'> & { id?: string }): Promise<SectionBadge>;
  deleteSectionBadge(id: string): Promise<void>;
  queryLogs(filters: { sectionId: string; participantId?: string; date?: string; activity?: string; action?: string; source?: string; event?: string; logType?: string }): Promise<LogEntry[]>;
  // Operations
  listEvaluations(instructorId: string): Promise<(CourseEvaluation & { section: SectionWithCourse })[]>;
  getEvaluation(sectionId: string): Promise<(CourseEvaluation & { section: SectionWithCourse }) | null>;
  listRepositories(filters: { query?: string; repository?: string; page: number; pageSize: number }): Promise<{ items: ContentRepository[]; total: number; pageCount: number }>;
  createRepository(input: { courseId: string; name: string; types: string; isDefault: boolean; format: string; sections: number; deactivateDuplicates: boolean }): Promise<{ repo: ContentRepository; deactivated: ContentRepository[] }>;
  updateRepository(id: string, patch: Partial<ContentRepository>): Promise<ContentRepository>;
  deleteRepository(id: string): Promise<void>;
  repositoryAction(id: string, action: 'push' | 'pull' | 'manage'): Promise<ContentRepository>;
  listScheduleChanges(instructorId: string, changeType?: string): Promise<(ScheduleChangeRequest & { section: SectionWithCourse })[]>;
  decideScheduleChange(input: { id: string; decision: 'accepted' | 'rejected'; note?: string }): Promise<ScheduleChangeRequest>;
  gradeSubmissionOverview(instructorId: string, filters: { sectionId?: string; status?: 'required' | 'submitted' | 'released' | 'all' }): Promise<{ section: SectionWithCourse; studentCount: number; missing: number; status: 'required' | 'submitted' | 'released' }[]>;
  listHistory(instructorId: string): Promise<HistoricalOffering[]>;
  // Registry (capability gated in UI + service)
  listFaculties(): Promise<(Faculty & { programs: AcademicProgram[] })[]>;
  saveFaculty(f: Omit<Faculty, 'id'> & { id?: string }): Promise<Faculty>;
  deleteFaculty(id: string): Promise<{ blockedBy?: string }>;
  saveProgram(p: Omit<AcademicProgram, 'id'> & { id?: string }): Promise<AcademicProgram>;
  deleteProgram(id: string): Promise<{ blockedBy?: string }>;
  listProgramTypes(query?: string): Promise<ProgramType[]>;
  saveProgramType(t: Omit<ProgramType, 'id' | 'order'> & { id?: string }): Promise<ProgramType>;
  reorderProgramTypes(orderedIds: string[]): Promise<ProgramType[]>;
  deleteProgramType(id: string): Promise<{ blockedBy?: string }>;
  listTerms(campus?: string): Promise<Term[]>;
  saveTerm(t: Omit<Term, 'id'> & { id?: string }): Promise<Term>;
  deleteTerm(id: string): Promise<{ blockedBy?: string }>;
  // Profile & accomplishments
  getProfile(instructorId: string): Promise<UserAccount>;
  updateProfile(instructorId: string, patch: Partial<InstructorProfile> & { displayName?: string; preferredName?: string; email?: string }): Promise<UserAccount>;
  accomplishments(instructorId: string): Promise<{ currentSections: number; coursesTaught: number; students: number; badgeBases: BadgeBase[]; issuedCount: number; records: FacultyRecord[]; studentBadges: { badgeCode: string; title: string; studentName: string; status: 'earned' | 'available'; year?: string }[] }>;
  createBadgeBase(input: Omit<BadgeBase, 'id' | 'createdAt' | 'status'>): Promise<BadgeBase>;
  addFacultyRecord(input: Omit<FacultyRecord, 'id'>): Promise<FacultyRecord>;
  updateFacultyRecord(id: string, patch: Partial<FacultyRecord>): Promise<FacultyRecord>;
  listSectionsForInstructor(instructorId: string): Promise<Section[]>;
}
