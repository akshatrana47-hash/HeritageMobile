export * from './auth';
export * from './learning';
export * from './academics';
export * from './records';
export * from './instructor';

import type { AuthService } from './auth';
import type { CatalogueService, EnrolmentService, LearningService, CoachService } from './learning';
import type { CoursesService, AssignmentsService, GradesService, AttendanceService, WorkshopsService } from './academics';
import type { RecordsService, TasksService, DocumentsService, FinanceService, RequestsService, NotificationsService, MailService, AskHeritageService } from './records';
import type { InstructorService } from './instructor';

export interface Services {
  auth: AuthService;
  catalogue: CatalogueService;
  enrolment: EnrolmentService;
  learning: LearningService;
  coach: CoachService;
  courses: CoursesService;
  assignments: AssignmentsService;
  grades: GradesService;
  attendance: AttendanceService;
  workshops: WorkshopsService;
  records: RecordsService;
  tasks: TasksService;
  documents: DocumentsService;
  finance: FinanceService;
  requests: RequestsService;
  notifications: NotificationsService;
  mail: MailService;
  askHeritage: AskHeritageService;
  instructor: InstructorService;
}
