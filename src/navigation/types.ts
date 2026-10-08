import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { MailFolder } from '../domain/types';

/** Entity IDs only are passed as params – never whole records. */
export type StudentTabParamList = {
  StudentHomeTab: undefined;
  StudentCoursesTab: undefined;
  StudentScheduleTab: { sectionId?: string } | undefined;
  StudentMessagesTab: undefined;
  StudentProfileTab: undefined;
};

export type InstructorTabParamList = {
  InstructorHomeTab: undefined;
  InstructorCoursesTab: undefined;
  InstructorGradesTab: undefined;
  InstructorMessagesTab: undefined;
  InstructorMoreTab: undefined;
};

export type WorkspaceTab = 'course' | 'classList' | 'attendance' | 'grades' | 'badges' | 'competency' | 'logs';

export type RootStackParamList = {
  Splash: undefined;
  Login: { role?: 'student' | 'instructor' } | undefined;
  ResetPassword: undefined;
  Forbidden: { reason?: string } | undefined;
  DevGallery: undefined;
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
  InstructorTabs: NavigatorScreenParams<InstructorTabParamList> | undefined;
  // Student catalogue + learning
  StudentCatalogue: undefined;
  StudentProgrammeDetails: { programmeId: string };
  StudentCheckout: { programmeId: string };
  StudentMyLearning: undefined;
  StudentOutline: { programmeId: string };
  StudentReading: { programmeId: string; activityId: string };
  StudentLecture: { programmeId: string; activityId: string };
  StudentPracticeQuiz: { programmeId: string; activityId: string };
  StudentMatching: { programmeId: string; activityId: string };
  StudentAssessment: { programmeId: string; activityId: string };
  StudentCourseComplete: { programmeId: string };
  StudentCertificate: { programmeId: string };
  StudentAskCoach: { programmeId: string; activityId: string };
  // Student enrolled courses
  StudentMyCourses: undefined;
  StudentCourseDetails: { sectionId: string; tab?: 'content' | 'grades' };
  StudentLearningObjectives: { sectionId: string };
  StudentCourseInfo: { sectionId: string; view?: 'weekly' | 'calendar' };
  StudentLiveRoom: { sectionId: string; roomId: string };
  StudentCourseQuiz: { sectionId: string; materialId: string };
  StudentAssignments: { filter?: 'all' | 'upcoming' | 'graded' | 'draft' } | undefined;
  StudentAssignmentDetails: { assignmentId: string };
  StudentAttendance: { sectionId?: string } | undefined;
  StudentWorkshops: { view?: 'mine' | 'available' | 'completed' } | undefined;
  StudentWorkshopDetails: { workshopId: string };
  // Student records
  StudentFinalMarks: undefined;
  StudentBadges: undefined;
  StudentExtracurricular: undefined;
  StudentProgramPlan: undefined;
  StudentRequiredTasks: { tab?: 'pending' | 'completed' } | undefined;
  StudentDocuments: undefined;
  StudentTaxDocuments: undefined;
  StudentFinance: undefined;
  StudentTransactions: { termId?: string } | undefined;
  StudentPayBalance: { termId: string; amount: number };
  StudentLeave: undefined;
  StudentRequestDetails: { requestId: string };
  StudentPersonalDetails: undefined;
  StudentSecurity: { next?: 'changePassword' | 'personalDetails' } | undefined;
  StudentChangePassword: undefined;
  StudentEnglishTest: undefined;
  StudentEnglishTestRegister: undefined;
  StudentProfile: undefined;
  StudentServices: undefined;
  StudentSupport: undefined;
  // Shared
  TimeZone: undefined;
  Notifications: undefined;
  Mail: { folder?: MailFolder } | undefined;
  MailCompose: { draftId?: string; toId?: string; subject?: string } | undefined;
  MailMessage: { messageId: string };
  AskHeritage: undefined;
  FileViewer: { asset: string; title: string };
  // Instructor
  InstructorDashboard: undefined;
  InstructorAiDraft: { courseId?: string } | undefined;
  InstructorEditLesson: { lessonId: string };
  InstructorLessonPreview: { lessonId: string };
  InstructorStudentList: undefined;
  InstructorStudentProfile: { studentId: string };
  InstructorMyCourses: undefined;
  InstructorCourseWorkspace: { sectionId: string; tab?: WorkspaceTab };
  InstructorMarkAttendance: { sectionId: string; date: string };
  InstructorGradeEntry: { sectionId: string };
  InstructorCourseAttendance: { date?: string; sectionId?: string } | undefined;
  InstructorEvaluations: undefined;
  InstructorEvaluationDetails: { sectionId: string };
  InstructorRepository: undefined;
  InstructorCreateContentCourse: { repoId?: string } | undefined;
  InstructorRepositoryHistory: { repoId: string };
  InstructorPendingSchedules: undefined;
  InstructorScheduleReview: { requestId: string };
  InstructorGradesSubmission: { sectionId?: string } | undefined;
  InstructorCourseHistory: undefined;
  InstructorCourseHistoryDetails: { offeringId: string };
  InstructorWorkshopEnrolments: { tab?: 'pending' | 'approved' | 'declined' } | undefined;
  InstructorWorkshopDetails: { workshopId: string };
  InstructorFaculties: undefined;
  InstructorAddFaculty: { facultyId?: string } | undefined;
  InstructorAddProgram: { programId?: string; facultyId?: string } | undefined;
  InstructorProgramTypes: undefined;
  InstructorManageTerms: undefined;
  InstructorTermForm: { termId?: string; mode?: 'view' | 'edit' } | undefined;
  InstructorProfile: { tab?: 'biography' | 'topics' | 'availability' | 'compensation' | 'schedule' | 'accomplishments' } | undefined;
  InstructorMore: undefined;
  InstructorLiveRoom: { sectionId: string; roomId: string };
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type StudentTabProps<T extends keyof StudentTabParamList> = CompositeScreenProps<BottomTabScreenProps<StudentTabParamList, T>, NativeStackScreenProps<RootStackParamList>>;
export type InstructorTabProps<T extends keyof InstructorTabParamList> = CompositeScreenProps<BottomTabScreenProps<InstructorTabParamList, T>, NativeStackScreenProps<RootStackParamList>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
