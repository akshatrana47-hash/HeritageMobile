import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, LoadingState, ErrorState, Icon } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useSection } from './useCourses';
import { formatDate } from '../../../utils/format';

export function LearningObjectivesScreen({ navigation, route }: RootScreenProps<'StudentLearningObjectives'>) {
  const { sectionId } = route.params;
  const section = useSection(sectionId);
  const s = section.data;
  return (
    <Screen testID="learning-objectives" header={<ScreenHeader />}>
      {section.isLoading ? <LoadingState /> : !s ? <ErrorState error={section.error} /> : (
        <Stack>
          <Text variant="displayMd" style={{ textTransform: 'uppercase' }}>{s.course.code}: {s.course.title}</Text>
          <Text variant="bodySm">{s.sectionCode}: {formatDate(s.startDate, { dot: true })} - {formatDate(s.endDate, { dot: true })}</Text>
          <Text variant="bodySm">{s.location}</Text>
          <Button title="All course information ›" variant="outline" onPress={() => navigation.navigate(Routes.StudentCourseInfo, { sectionId })} testID="objectives-all-info" />
          <Row gap={spacing.sm}><View style={styles.tile}><Icon name="FileText" size={18} color={colors.green900} /></View><Text variant="titleMd">Learning Objectives</Text></Row>
          <Card>
            <Text variant="body">{s.objectives}</Text>
            <Text variant="caption" style={{ marginTop: spacing.md }}>Last modified: Tuesday, 15 September 2026, 6:40 PM (demo)</Text>
          </Card>
          <Row gap={spacing.sm}><View style={styles.tile}><Icon name="BookOpen" size={18} color={colors.green900} /></View><Text variant="titleMd">Brief Course Description</Text></Row>
          <Card><Text variant="body">{s.description}</Text></Card>
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ tile: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.info100, alignItems: 'center', justifyContent: 'center' } });
