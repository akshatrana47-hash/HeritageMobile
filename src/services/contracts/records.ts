import type {
  Badge, BadgeAward, ExtracurricularRecord, PlanCourse, RequiredTask, StudentDocument, TaxDocument, FinanceStatement, FinanceTransaction,
  ChangeRequest, SubmissionAttachment, EnglishTestRegistration, Notification, MailMessage, MailFolder, Contact, MailAttachment,
} from '../../domain/types';

export interface BadgeWithProgress extends Badge {
  award?: BadgeAward;
  progress: { current: number; target: number };
  earned: boolean;
}

export interface RecordsService {
  listBadges(studentId: string): Promise<BadgeWithProgress[]>;
  listExtracurricular(studentId: string): Promise<ExtracurricularRecord[]>;
  listPlan(studentId: string): Promise<PlanCourse[]>;
  requestTranscript(studentId: string): Promise<ChangeRequest>;
}

export interface TasksService {
  list(studentId: string): Promise<RequiredTask[]>;
  complete(input: { taskId: string; studentId: string; evidence?: SubmissionAttachment; confirmation?: boolean }): Promise<RequiredTask>;
}

export interface DocumentsService {
  list(studentId: string): Promise<StudentDocument[]>;
  listTax(studentId: string): Promise<TaxDocument[]>;
  requestSpecialLetter(input: { studentId: string; purpose: string; details: string }): Promise<ChangeRequest>;
}

export interface FinanceService {
  listStatements(studentId: string): Promise<(FinanceStatement & { totalCharges: number; totalTax: number; totalPayments: number; balance: number })[]>;
  listTransactions(studentId: string, termId?: string): Promise<FinanceTransaction[]>;
  /** DEMO payment. Never charges money. */
  payBalance(input: { studentId: string; termId: string; amount: number; outcome: 'success' | 'cancel' | 'fail' }): Promise<FinanceTransaction | null>;
}

export interface RequestsService {
  list(studentId: string, kind?: ChangeRequest['kind']): Promise<ChangeRequest[]>;
  get(requestId: string): Promise<ChangeRequest>;
  submitPersonalDetails(input: { studentId: string; payload: Record<string, unknown> }): Promise<ChangeRequest>;
  submitLeave(input: { studentId: string; startDate: string; endDate: string; reason: string }): Promise<ChangeRequest>;
  registerEnglishTest(input: Omit<EnglishTestRegistration, 'id' | 'status' | 'createdAt'>): Promise<EnglishTestRegistration>;
  listEnglishTests(studentId: string): Promise<EnglishTestRegistration[]>;
}

export interface NotificationsService {
  list(userId: string): Promise<Notification[]>;
  markRead(userId: string, notificationId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

export interface MailService {
  list(userId: string, folder: MailFolder): Promise<MailMessage[]>;
  get(messageId: string): Promise<MailMessage>;
  listContacts(): Promise<Contact[]>;
  saveDraft(input: { userId: string; draftId?: string; toIds: string[]; subject: string; body: string; attachments: MailAttachment[] }): Promise<MailMessage>;
  /** Queues the message in Outbox (demo). Nothing is really sent. */
  send(input: { userId: string; draftId?: string; toIds: string[]; subject: string; body: string; attachments: MailAttachment[] }): Promise<MailMessage>;
  /** Processes queued outbox messages: deterministic success unless `fail` is set. */
  processOutbox(userId: string, opts?: { fail?: boolean }): Promise<MailMessage[]>;
  retry(messageId: string): Promise<MailMessage>;
  markRead(messageId: string, read: boolean): Promise<void>;
  flag(messageId: string, flagged: boolean): Promise<void>;
  move(messageIds: string[], folder: MailFolder): Promise<void>;
  deletePermanently(messageIds: string[]): Promise<void>;
}

export interface AskHeritageAnswer {
  id: string;
  question: string;
  createdAt: string;
  context: string;
  assessment: string;
  facts: { kind: 'FACT' | 'INFERENCE' | 'CONFLICT' | 'UNCERTAINTY'; text: string }[];
  requirements?: { code: string; title: string; meta: string; status: 'inProgress' | 'blocked' | 'missing' | 'done'; blockedBy?: string }[];
  actions: { label: string; route: string; params?: Record<string, string> }[];
  sources: { label: string; route?: string; params?: Record<string, string> }[];
  feedback?: 'up' | 'down';
}

export interface AskHeritageService {
  suggestions(userId: string): Promise<string[]>;
  ask(userId: string, question: string): Promise<AskHeritageAnswer>;
  history(userId: string): Promise<AskHeritageAnswer[]>;
  feedback(userId: string, answerId: string, value: 'up' | 'down'): Promise<void>;
}
