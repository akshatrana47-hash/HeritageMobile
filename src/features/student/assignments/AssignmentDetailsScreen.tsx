import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, LoadingState, ErrorState, Icon, StatTile, KeyValueRow, InfoBanner, ProgressBar, BottomSheet, ListRow, ConfirmSheet, Input, DemoLabel, Toggle } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useAssignment, useAssignmentMutations } from '../courses/useCourses';
import { formatDate, formatDateTime, daysUntil, formatBytes } from '../../../utils/format';
import { pickAttachment, canPreviewInApp, removeLocalCopy } from '../../shared/files';
import { useFileActions } from '../../shared/useFileActions';
import type { SubmissionAttachment } from '../../../domain/types';
import { appConfig } from '../../../config/appConfig';
import { toast } from '../../../state/uiStore';
import { errorMessage } from '../../../services/errors';
import { useUnsavedChangesGuard } from '../../shared/hooks';
import { STATUS_TONE } from './AssignmentsScreen';
import { useSettings } from '../../auth/useAuth';

export function AssignmentDetailsScreen({ navigation, route }: RootScreenProps<'StudentAssignmentDetails'>) {
  const { assignmentId } = route.params;
  const q = useAssignment(assignmentId);
  const m = useAssignmentMutations(assignmentId);
  const files = useFileActions();
  const settings = useSettings();
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>([]);
  const [note, setNote] = useState('');
  const [dirty, setDirty] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [menu, setMenu] = useState(false);
  const [simulateFail, setSimulateFail] = useState(false);
  const { allowLeave } = useUnsavedChangesGuard(dirty, 'Your attachment or note is not saved as a draft. Discard it?');
  const a = q.data;
  useEffect(() => {
    if (a?.submission && !dirty) {
      setAttachments(a.submission.attachments);
      setNote(a.submission.note ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.submission?.updatedAt]);
  const editable = !a || a.derivedStatus === 'upcoming' || a.derivedStatus === 'draft';
  const max = appConfig.demo.attachmentMaxCount;
  const addFile = async () => {
    const res = await pickAttachment();
    if (res.status === 'cancelled') { toast('Picker cancelled', 'info'); return; }
    if (res.status === 'error') { toast(res.message, 'error'); return; }
    setAttachments(prev => [...prev.slice(0, max - 1), res.attachment]);
    setDirty(true);
  };
  const removeFile = async (att: SubmissionAttachment) => {
    setAttachments(prev => prev.filter(x => x.id !== att.id));
    setDirty(true);
    await removeLocalCopy(att.uri);
  };
  const saveDraft = async () => {
    try {
      await m.saveDraft.mutateAsync({ attachments, note });
      setDirty(false);
      toast('Draft saved', 'success');
    } catch (e) {
      toast(errorMessage(e), 'error');
    }
  };
  const submit = async () => {
    setConfirm(false);
    setUploadError(null);
    setProgress(0);
    try {
      await m.submit.mutateAsync({ attachments, note, failUpload: simulateFail, onProgress: setProgress });
      setSimulateFail(false);
      setDirty(false);
      allowLeave();
      setProgress(null);
      toast('Submission received', 'success');
    } catch (e) {
      setProgress(null);
      setUploadError(errorMessage(e));
    }
  };
  const tz = settings.data?.timeZone;
  return (
    <Screen testID="assignment-details" header={<ScreenHeader backLabel="All assignments" actions={a ? [{ label: 'Open course', accessibilityLabel: 'Open course', onPress: () => navigation.navigate(Routes.StudentCourseDetails, { sectionId: a.sectionId }), testID: 'assignment-open-course' }, { icon: 'EllipsisVertical', accessibilityLabel: 'More', onPress: () => setMenu(true) }] : []} />}>
      {q.isLoading ? <LoadingState /> : !a ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : (
        <Stack>
          <Card>
            <Stack gap={spacing.sm}>
              <Row justify="space-between"><Pill label={`${a.section.course.code} · ${a.section.course.title}`} tone="grey" small icon={<Icon name="GraduationCap" size={12} color={colors.inkSecondary} />} /><Pill label={STATUS_TONE[a.derivedStatus].label} tone={STATUS_TONE[a.derivedStatus].tone} small /></Row>
              <Text variant="displayMd" style={{ textTransform: 'uppercase' }}>{a.title}</Text>
              <Text variant="bodySm">{a.description}</Text>
              <Row><StatTile label="Status" value={STATUS_TONE[a.derivedStatus].label} sub={a.section.course.code} /><StatTile label="Points" value={a.points} sub="Maximum score" /></Row>
              <Row><StatTile label="Weight" value={`${a.weightPct}%`} sub="Course grade" /><StatTile label="Due date" value={a.dueAt ? formatDate(a.dueAt) : 'Not set'} sub={a.dueAt ? <Text variant="caption" color={daysUntil(a.dueAt) < 0 ? colors.danger600 : colors.coral600}>{formatDateTime(a.dueAt, tz).split(', ')[1]} · {daysUntil(a.dueAt) < 0 ? `${-daysUntil(a.dueAt)} days overdue` : `${daysUntil(a.dueAt)} days left`}</Text> : undefined} /></Row>
            </Stack>
          </Card>
          <Card>
            <Row justify="space-between" style={{ marginBottom: spacing.sm }}><Text variant="overline">Overview</Text><Text variant="caption">Specification</Text></Row>
            <KeyValueRow label="Course" value={`${a.section.course.code} · ${a.section.course.title}`} />
            <KeyValueRow label="Title" value={a.title} />
            <KeyValueRow label="Due date" value={a.dueAt ? formatDateTime(a.dueAt, tz) : 'Not set'} />
            <KeyValueRow label="Grading" value={`${a.points} points · ${a.weightPct}% weight`} border={false} />
          </Card>
          {a.mark ? (
            <Card tone="green">
              <Row justify="space-between"><Text variant="titleSm">Released grade</Text><Pill label={`${a.mark.score} / ${a.points}`} tone="green" /></Row>
              {a.mark.feedback ? <Text variant="bodySm" style={{ marginTop: 4 }}>Feedback: {a.mark.feedback}</Text> : null}
              <Text variant="caption" style={{ marginTop: 4 }}>Released {formatDateTime(a.mark.updatedAt, tz)}</Text>
            </Card>
          ) : null}
          {a.submission?.receiptId && a.submission.status !== 'draft' ? (
            <Card tone="info">
              <Row justify="space-between"><Text variant="titleSm">Submission receipt</Text><Pill label={a.submission.status.toUpperCase()} tone={a.submission.status === 'late' ? 'red' : 'blue'} small /></Row>
              <Text variant="bodySm">Receipt {a.submission.receiptId} · submitted {formatDateTime(a.submission.submittedAt!, tz)}</Text>
              <Text variant="caption">Submitting work does not publish a grade. Your instructor marks and releases grades separately.</Text>
            </Card>
          ) : null}
          <Card>
            <Row justify="space-between" style={{ marginBottom: spacing.sm }}><Text variant="titleSm">Your submission ({attachments.length}/{max})</Text><Pill label={attachments.length ? `${attachments.length} file` : 'No files'} tone="grey" small /></Row>
            {attachments.length ? attachments.map(att => (
              <Row key={att.id} gap={spacing.sm} style={styles.fileRow}>
                <View style={styles.fileIcon}><Icon name={/pdf/i.test(att.mimeType) ? 'FileText' : /image/.test(att.mimeType) ? 'Image' : /zip/.test(att.mimeType) ? 'FileArchive' : 'File'} size={18} color={colors.green900} /></View>
                <View style={{ flex: 1 }}><Text variant="bodyStrong" numberOfLines={1}>{att.name}</Text><Text variant="caption">{formatBytes(att.size)} · {att.mimeType}</Text></View>
                {canPreviewInApp(att.mimeType, att.name) ? <Pressable accessibilityRole="button" accessibilityLabel="Preview file" onPress={() => files.viewPath(att.uri, att.mimeType, att.name)} style={styles.iconBtn} testID="attachment-preview"><Icon name="Eye" size={18} /></Pressable> : <Pressable accessibilityRole="button" accessibilityLabel="Open with another app" onPress={() => files.sharePath(att.uri, att.name)} style={styles.iconBtn}><Icon name="ExternalLink" size={18} /></Pressable>}
                {editable ? <Pressable accessibilityRole="button" accessibilityLabel="Remove file" onPress={() => removeFile(att)} style={styles.iconBtn} testID="attachment-remove"><Icon name="Trash2" size={18} color={colors.danger600} /></Pressable> : null}
              </Row>
            )) : <Text variant="bodySm">No files uploaded yet.</Text>}
            {!attachments.some(x => canPreviewInApp(x.mimeType, x.name)) && attachments.length ? <Text variant="caption">In-app preview is unavailable for this format; use Open with another app. The file can still be submitted.</Text> : null}
            {editable && attachments.length < max ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Choose a file to upload" onPress={addFile} style={styles.dropzone} testID="attachment-add">
                <Icon name="CloudUpload" size={28} color={colors.green700} />
                <Text variant="bodyStrong">Choose a file to upload</Text>
                <Text variant="caption">PDF, Office, images, or ZIP · up to {Math.round(appConfig.demo.attachmentMaxBytes / (1024 * 1024))} MiB</Text>
                <Button title="Browse Files" variant="outline" size="sm" fullWidth={false} onPress={addFile} />
              </Pressable>
            ) : null}
            {editable ? <Input label="Note to instructor (optional)" placeholder="Add a short note" value={note} onChangeText={t => { setNote(t); setDirty(true); }} containerStyle={{ marginTop: spacing.sm }} testID="assignment-note" /> : null}
            {progress !== null ? <View style={{ marginTop: spacing.sm, gap: 4 }}><ProgressBar value={progress * 100} /><Text variant="caption">Uploading… {Math.round(progress * 100)}% (simulated)</Text></View> : null}
            {uploadError ? <InfoBanner tone="coral" icon="TriangleAlert" title="Upload failed" text={uploadError} /> : null}
            {editable ? (
              <Stack gap={spacing.sm} style={{ marginTop: spacing.md }}>
                {uploadError ? <Button title="Retry upload" variant="coral" onPress={() => { setSimulateFail(false); void submit(); }} testID="assignment-retry" /> : null}
                <Button title="Submit assignment" variant="coral" disabled={!attachments.length || progress !== null} disabledReason={attachments.length ? undefined : 'Attach your completed document above to enable submission.'} onPress={() => setConfirm(true)} testID="assignment-submit" />
                <Button title="Save draft" variant="outline" onPress={saveDraft} loading={m.saveDraft.isPending} testID="assignment-save-draft" />
                <Toggle label="Simulate upload failure (demo)" value={simulateFail} onChange={setSimulateFail} testID="assignment-simulate-fail" />
              </Stack>
            ) : null}
          </Card>
          {a.dueAt ? <InfoBanner tone="gold" icon="Info" title="Late submission policy (demo text)" text={`Submissions past ${formatDateTime(a.dueAt, tz)} are marked late and may require academic department approval.`} /> : null}
          <DemoLabel text="Native document picker · local copies kept in app Documents" />
        </Stack>
      )}
      <ConfirmSheet visible={confirm} onClose={() => setConfirm(false)} onConfirm={submit} title="Submit assignment?" message={`You are submitting ${attachments.length} file(s) for ${a?.title}. This is final — you cannot edit after submitting.`} confirmLabel="Submit" icon="Send" testID="assignment-confirm" />
      <BottomSheet visible={menu} onClose={() => setMenu(false)} title="Assignment">
        <ListRow icon="BookOpen" title="Open course" onPress={() => { setMenu(false); if (a) navigation.navigate(Routes.StudentCourseDetails, { sectionId: a.sectionId, tab: 'grades' }); }} />
        <ListRow icon="ClipboardList" title="All assignments" onPress={() => { setMenu(false); navigation.navigate(Routes.StudentAssignments); }} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fileRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  fileIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.green50, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dropzone: { marginTop: spacing.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: 14, padding: spacing.lg, alignItems: 'center', gap: 6 },
});
