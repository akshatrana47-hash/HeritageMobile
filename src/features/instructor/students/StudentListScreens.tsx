import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, Input, ChipRow, LoadingState, ErrorState, EmptyState, Avatar, AlphabetBar, Pager, BottomSheet, Select, KeyValueRow, DemoLabel, InfoBanner, ListRow } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useStudents, useStudent } from '../useInstructor';
import { useDebounced } from '../../shared/hooks';
import { formatDateTime } from '../../../utils/format';

const STATUS_TONE: Record<string, 'teal' | 'grey' | 'blue' | 'red' | 'yellow' | 'green'> = { 'Active Student': 'teal', 'Former Student': 'grey' };

export function StudentListScreen({ navigation }: RootScreenProps<'InstructorStudentList'>) {
  const [category, setCategory] = useState<'all' | 'active' | 'former'>('all');
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(false);
  const [program, setProgram] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const q = useDebounced(query);
  const students = useStudents({ category, query: q, letter, page, pageSize, program: program || undefined });
  const all = useStudents({ category: 'all', page: 1, pageSize: 500 });
  const active = useStudents({ category: 'active', page: 1, pageSize: 500 });
  const former = useStudents({ category: 'former', page: 1, pageSize: 500 });
  const d = students.data;
  return (
    <Screen scroll={false} padded={false} testID="student-list" header={<ScreenHeader backLabel="Student List" />}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <ChipRow options={[{ value: 'all', label: 'Browse All Students', count: all.data?.total }, { value: 'active', label: 'Active Student', count: active.data?.total }, { value: 'former', label: 'Former', count: former.data?.total }]} value={category} onChange={c => { setCategory(c); setPage(1); }} testID="students-category" />
        <Row style={{ marginVertical: spacing.sm }}><View style={{ flex: 1 }}><Input placeholder="Search Students..." leftIcon="Search" value={query} onChangeText={t => { setQuery(t); setPage(1); }} testID="students-search" /></View><Button title="Filters" variant="outline" fullWidth={false} icon={<Row gap={4}><View style={[styles.dot, program ? { backgroundColor: colors.coral500 } : null]} /></Row>} onPress={() => setFilters(true)} testID="students-filters" /></Row>
        <AlphabetBar value={letter} onChange={l => { setLetter(l); setPage(1); }} testID="students-letter" />
        <View style={{ marginVertical: spacing.sm }}><Pager page={page} pageCount={d?.pageCount ?? 1} onChange={setPage} total={d?.total} pageSize={pageSize} onPageSize={setPageSize} testID="students-pager" /></View>
        <InfoBanner tone="grey" icon="ShieldCheck" text="Directory limited to students enrolled in your sections (authorised fixture records). A broad directory in the reference does not establish production access rights." />
      </View>
      {students.isLoading ? <LoadingState /> : students.error ? <ErrorState error={students.error} onRetry={() => students.refetch()} /> : (
        <FlatList data={d?.items ?? []} keyExtractor={u => u.id} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<EmptyState icon="UserX" title="No students match" action={{ label: 'Clear filters', onPress: () => { setQuery(''); setLetter('ALL'); setProgram(''); setCategory('all'); } }} />}
          renderItem={({ item: u }) => (
            <Card padding={spacing.md} onPress={() => navigation.navigate(Routes.InstructorStudentProfile, { studentId: u.id })} testID={`student-${u.id}`}>
              <Row gap={spacing.md} align="flex-start">
                <Avatar initials={u.avatarInitials} bg={colors.surfaceMuted} fg={colors.green900} />
                <View style={{ flex: 1 }}>
                  <Row justify="space-between"><Text variant="titleSm">{u.lastName}, {u.firstName}</Text><Pill label={u.status} tone={STATUS_TONE[u.status] ?? 'grey'} small /></Row>
                  <Text variant="mono">ID: {u.student?.studentNumber}</Text>
                  <KeyValueRow label="Program" value={u.student?.programName ?? ''} border={false} />
                  <KeyValueRow label="Program Term" value={u.termLabel} border={false} />
                  <KeyValueRow label="Admission Term" value={u.admissionTerm} border={false} />
                  <KeyValueRow label="Advisor" value={u.student?.advisorName.split(' ').reverse().join(', ') ?? ''} border={false} />
                  <KeyValueRow label="Date" value={formatDateTime(u.updatedAt)} border={false} />
                  <View style={styles.dashed} />
                  <Text variant="label" color={colors.green900}>View profile & records ›</Text>
                </View>
              </Row>
            </Card>
          )}
          ListFooterComponent={<View style={{ marginTop: spacing.md }}><DemoLabel text="Status/term values are synthetic" /></View>}
        />
      )}
      <BottomSheet visible={filters} onClose={() => setFilters(false)} title="Filters" testID="students-filter-sheet">
        <Select label="Program" value={program} onChange={v => { setProgram(v); setPage(1); }} options={[{ value: '', label: 'All programs' }, { value: 'Computer Science (B.Sc.)', label: 'Computer Science (B.Sc.)' }, { value: 'Nursing', label: 'Nursing' }, { value: 'Business', label: 'Business' }]} testID="students-program" />
        <Select label="Per page" value={String(pageSize)} onChange={v => { setPageSize(Number(v)); setPage(1); }} options={[{ value: '2', label: '2 (demo paging)' }, { value: '10', label: '10' }, { value: '50', label: '50' }]} testID="students-pagesize" />
        <Button title="Apply" onPress={() => setFilters(false)} />
      </BottomSheet>
    </Screen>
  );
}

export function InstructorStudentProfileScreen({ navigation, route }: RootScreenProps<'InstructorStudentProfile'>) {
  const q = useStudent(route.params.studentId);
  const u = q.data;
  return (
    <Screen testID="instructor-student-profile" header={<ScreenHeader backLabel="Students" />}>
      {q.isLoading ? <LoadingState /> : !u ? <ErrorState error={q.error} /> : (
        <Stack>
          <Card tone="dark">
            <Row gap={spacing.md}><Avatar initials={u.avatarInitials} size={52} bg={colors.gold500} fg={colors.green900} /><View style={{ flex: 1 }}><Text variant="displaySm" color={colors.white}>{u.displayName}</Text><Text variant="bodySm" color={colors.green100}>{u.student?.studentNumber} · {u.student?.programName}</Text></View></Row>
          </Card>
          <Card>
            <Text variant="overline" style={{ marginBottom: 4 }}>Records visible to you</Text>
            <KeyValueRow label="Email" value={u.email} />
            <KeyValueRow label="Advisor" value={u.student?.advisorName ?? ''} />
            <KeyValueRow label="Catalog year" value={u.student?.catalogYear ?? ''} border={false} />
          </Card>
          <Card>
            <Text variant="overline" style={{ marginBottom: 4 }}>Enrolled in your sections</Text>
            {u.sections.map(s => <ListRow key={s.id} icon="BookOpen" title={`${s.course.code} · ${s.course.title}`} subtitle={s.sectionCode} onPress={() => navigation.navigate(Routes.InstructorCourseWorkspace, { sectionId: s.id, tab: 'classList' })} />)}
          </Card>
          <InfoBanner tone="grey" icon="Lock" text="Personal contact details, sensitive identifiers and records outside your sections are not exposed to instructors in this demo." />
          <Button title="Message student" variant="outline" onPress={() => navigation.navigate(Routes.MailCompose, { toId: u.id })} testID="student-message" />
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { paddingHorizontal: spacing.lg, paddingBottom: 40 }, dashed: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: 6 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border } });
