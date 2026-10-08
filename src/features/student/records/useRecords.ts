import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../app/ServicesProvider';
import { qk } from '../../../app/queryKeys';
import { useCurrentUserId } from '../../../state/sessionStore';
import type { SubmissionAttachment, ChangeRequest } from '../../../domain/types';

export function useFinalMarks() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.finalMarks(userId), queryFn: () => s.grades.listFinalMarks(userId) });
}
export function useBadges() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.badges(userId), queryFn: () => s.records.listBadges(userId) });
}
export function useExtracurricular() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.extracurricular(userId), queryFn: () => s.records.listExtracurricular(userId) });
}
export function usePlan() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.plan(userId), queryFn: () => s.records.listPlan(userId) });
}
export function useTasks() {
  const s = useServices(); const userId = useCurrentUserId(); const qc = useQueryClient();
  const list = useQuery({ queryKey: qk.tasks(userId), queryFn: () => s.tasks.list(userId) });
  const complete = useMutation({ mutationFn: (p: { taskId: string; evidence?: SubmissionAttachment; confirmation?: boolean }) => s.tasks.complete({ studentId: userId, ...p }), onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks(userId) }) });
  return { list, complete };
}
export function useDocuments() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.documents(userId), queryFn: () => s.documents.list(userId) });
}
export function useTaxDocuments() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.taxDocs(userId), queryFn: () => s.documents.listTax(userId) });
}
export function useStatements() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.statements(userId), queryFn: () => s.finance.listStatements(userId) });
}
export function useTransactions(termId?: string) {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.transactions(userId, termId), queryFn: () => s.finance.listTransactions(userId, termId) });
}
export function useRequests(kind?: ChangeRequest['kind']) {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.requests(userId, kind), queryFn: () => s.requests.list(userId, kind) });
}
export function useRequest(id: string) {
  const s = useServices();
  return useQuery({ queryKey: ['request', id], queryFn: () => s.requests.get(id) });
}
export function useEnglishTests() {
  const s = useServices(); const userId = useCurrentUserId();
  return useQuery({ queryKey: qk.englishTests(userId), queryFn: () => s.requests.listEnglishTests(userId) });
}
export function useRecordMutations() {
  const s = useServices(); const userId = useCurrentUserId(); const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['requests', userId] });
    qc.invalidateQueries({ queryKey: qk.transactions(userId) });
    qc.invalidateQueries({ queryKey: qk.statements(userId) });
    qc.invalidateQueries({ queryKey: qk.englishTests(userId) });
  };
  return {
    requestTranscript: useMutation({ mutationFn: () => s.records.requestTranscript(userId), onSuccess: inv }),
    requestLetter: useMutation({ mutationFn: (p: { purpose: string; details: string }) => s.documents.requestSpecialLetter({ studentId: userId, ...p }), onSuccess: inv }),
    payBalance: useMutation({ mutationFn: (p: { termId: string; amount: number; outcome: 'success' | 'cancel' | 'fail' }) => s.finance.payBalance({ studentId: userId, ...p }), onSettled: inv }),
    submitPersonalDetails: useMutation({ mutationFn: (payload: Record<string, unknown>) => s.requests.submitPersonalDetails({ studentId: userId, payload }), onSuccess: inv }),
    submitLeave: useMutation({ mutationFn: (p: { startDate: string; endDate: string; reason: string }) => s.requests.submitLeave({ studentId: userId, ...p }), onSuccess: inv }),
    registerEnglishTest: useMutation({ mutationFn: (p: Omit<Parameters<typeof s.requests.registerEnglishTest>[0], 'studentId'>) => s.requests.registerEnglishTest({ studentId: userId, ...p }), onSuccess: inv }),
  };
}
