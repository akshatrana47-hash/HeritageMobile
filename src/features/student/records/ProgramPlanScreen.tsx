import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, LoadingState, ErrorState, EmptyState, Icon, Select, Input, BottomSheet, KeyValueRow, DemoLabel } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { usePlan } from './useRecords';
import { formatDate } from '../../../utils/format';
import type { PlanCourse } from '../../../domain/types';
import { useFileActions } from '../../shared/useFileActions';
import { toast } from '../../../state/uiStore';

const STATUS: Record<PlanCourse['status'], { label: string; tone: 'green' | 'coral' | 'grey' | 'yellow'; color: string }> = {
  completed: { label: '✓ Completed', tone: 'green', color: colors.success600 },
  dropped: { label: 'Dropped Course', tone: 'coral', color: colors.coral500 },
  notStarted: { label: 'Not Started', tone: 'grey', color: colors.inkFaint },
  inProgress: { label: '• In Progress', tone: 'yellow', color: colors.gold500 },
};

export function ProgramPlanScreen({ navigation }: RootScreenProps<'StudentProgramPlan'>) {
  const plan = usePlan();
  const files = useFileActions();
  const [status, setStatus] = useState<'all' | PlanCourse['status']>('all');
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [detail, setDetail] = useState<PlanCourse | null>(null);
  const data = useMemo(() => plan.data ?? [], [plan.data]);
  const counts = { inProgress: data.filter(c => c.status === 'inProgress').length, completed: data.filter(c => c.status === 'completed').length, dropped: data.filter(c => c.status === 'dropped').length, notStarted: data.filter(c => c.status === 'notStarted').length };
  const list = useMemo(() => data.filter(c => (status === 'all' || c.status === status) && (!query.trim() || `${c.code} ${c.title}`.toLowerCase().includes(query.toLowerCase()))), [data, status, query]);
  const completion = data.length ? Math.round((counts.completed / data.length) * 100) : 0;
  const active = data.length ? Math.round(((counts.completed + counts.inProgress) / data.length) * 100) : 0;
  return (
    <Screen testID="program-plan" header={<ScreenHeader actions={[{ icon: 'Search', accessibilityLabel: 'Search courses', onPress: () => setShowSearch(v => !v), testID: 'plan-search-toggle' }]} />}>
      {plan.isLoading ? <LoadingState /> : plan.error ? <ErrorState error={plan.error} onRetry={() => plan.refetch()} /> : (
        <Stack>
          <Text variant="displayLg">Program Plan</Text>
          <Text variant="body">Track your required courses, schedules, academic progression, and term milestones.</Text>
          <Card>
            <Row justify="space-between"><Row gap={6}><View style={styles.dot} /><Text variant="overline">Curriculum pathway</Text></Row><Pill label={`${data.length} Total Courses`} tone="grey" small /></Row>
            <Row style={{ marginTop: spacing.sm }}>
              {[['In Progress', counts.inProgress, colors.gold500], ['Completed', counts.completed, colors.success600], ['Dropped', counts.dropped, colors.coral500], ['Upcoming', counts.notStarted, colors.inkFaint]].map(([l, v, c]) => <View key={String(l)} style={styles.stat}><Text variant="displaySm" color={String(c)}>{v}</Text><Text variant="caption">{l}</Text></View>)}
            </Row>
            <View style={styles.segBar}>
              {[counts.completed, counts.inProgress, counts.dropped, counts.notStarted].map((n, i) => <View key={i} style={{ flex: n || 0.001, backgroundColor: [colors.success600, colors.gold500, colors.coral500, colors.border][i] }} />)}
            </View>
            <Row justify="space-between"><Text variant="caption">Overall Completion: {completion}% ({counts.completed}/{data.length})</Text><Text variant="caption">Active: {active}%</Text></Row>
          </Card>
          <Card padding={spacing.md}>
            <Select compact label="Filter status" value={status} onChange={setStatus} testID="plan-status" options={[{ value: 'all', label: `All Statuses (${data.length})` }, { value: 'inProgress', label: `In Progress (${counts.inProgress})` }, { value: 'completed', label: `Completed (${counts.completed})` }, { value: 'dropped', label: `Dropped (${counts.dropped})` }, { value: 'notStarted', label: `Not Started (${counts.notStarted})` }]} />
            {showSearch || query ? <Input label="Search course" placeholder="Code or title (e.g. CS201, Algorithms)" value={query} onChangeText={setQuery} containerStyle={{ marginTop: spacing.sm }} testID="plan-search" /> : null}
            <Row justify="space-between" style={{ marginTop: spacing.sm }}><Text variant="bodySm">Showing {list.length === data.length ? 'all ' : ''}{list.length} courses</Text><Pressable accessibilityRole="button" onPress={() => { setStatus('all'); setQuery(''); }} testID="plan-reset"><Text variant="label" color={colors.coral600}>Reset</Text></Pressable></Row>
          </Card>
          {!list.length ? <EmptyState icon="Route" title="No courses match" /> : list.map(c => (
            <Card key={c.id} onPress={() => setDetail(c)} testID={`plan-${c.id}`}>
              <Row justify="space-between"><Text variant="titleMd">({String(c.order).padStart(2, '0')}) {c.code}</Text><Pill label={STATUS[c.status].label} tone={STATUS[c.status].tone} small /></Row>
              <Text variant="bodyStrong" style={{ marginTop: 2 }}>{c.title}</Text>
              <Row gap={6} style={{ marginTop: 6 }}><Icon name="Calendar" size={13} color={colors.inkMuted} /><Text variant="caption">{formatDate(c.startDate, { dot: true, weekday: true })} - {formatDate(c.endDate, { dot: true, weekday: true })}</Text></Row>
              <Row gap={6}><Icon name="Clock" size={13} color={colors.inkMuted} /><Text variant="caption">{c.scheduleLabel}</Text></Row>
              <Text variant="label" color={c.status === 'dropped' ? colors.coral600 : colors.green900} style={{ marginTop: 6 }}>{c.status === 'dropped' ? 'Retake options / History →' : c.status === 'notStarted' ? (c.campusRoom === 'TBD' && c.scheduleLabel.includes('Placement') ? 'Placement guidelines →' : 'Syllabus preview →') : 'View course details →'}</Text>
            </Card>
          ))}
          <Card tone="gold">
            <Text variant="overline" style={{ marginBottom: 4 }}>Office of the Registrar (demo)</Text>
            <Text variant="caption">Any schedule modification requires formal department approval and degree audit sync. The export below is a sample academic audit generated locally, not an official document.</Text>
            <Button title="Download sample academic audit (PDF)" icon={<Icon name="Download" size={16} color={colors.white} />} style={{ marginTop: spacing.sm }} loading={files.busy === 'download:audit'} onPress={() => files.download('audit', 'academic-audit-SAMPLE.pdf')} testID="plan-export" />
          </Card>
          <DemoLabel text="Summaries derived from plan fixtures" />
        </Stack>
      )}
      <BottomSheet visible={!!detail} onClose={() => setDetail(null)} title={detail ? `(${String(detail.order).padStart(2, '0')}) ${detail.code}` : ''} subtitle={detail?.title} testID="plan-detail">
        {detail ? (<>
          <KeyValueRow label="Enrollment Status" value={STATUS[detail.status].label.replace(/^[•✓] /, '')} />
          <KeyValueRow label="Dates" value={`${formatDate(detail.startDate, { dot: true })} - ${formatDate(detail.endDate, { dot: true })}`} />
          <KeyValueRow label="Schedule" value={detail.scheduleLabel} />
          <KeyValueRow label="Campus & Room" value={detail.campusRoom} border={false} />
          {detail.retakeSectionCode ? <Text variant="caption" style={{ marginBottom: spacing.sm }}>Retake section: {detail.retakeSectionCode}{detail.status === 'dropped' ? ' · history: dropped Nov 2025, retake in progress (07)' : ''}</Text> : null}
          <Row>
            <Button title="Go to Course" style={{ flex: 1 }} disabled={!detail.sectionId} disabledReason={detail.sectionId ? undefined : 'Not enrolled in a section yet'} onPress={() => { setDetail(null); navigation.navigate(Routes.StudentCourseDetails, { sectionId: detail.sectionId! }); }} testID="plan-go-course" />
            <Button title="View Syllabus" variant="subtle" style={{ flex: 1 }} onPress={() => { files.view('syllabus'); }} testID="plan-syllabus" />
          </Row>
          {detail.status === 'dropped' ? <Button title="Retake options / History" variant="ghost" onPress={() => { setDetail(null); const retake = data.find(x => x.code === detail.code && x.id !== detail.id); if (retake) setTimeout(() => setDetail(retake), 300); else toast('No retake section found', 'info'); }} testID="plan-retake" /> : null}
        </>) : null}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green900 },
  stat: { flex: 1, alignItems: 'center' },
  segBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: spacing.sm },
});
