import React, { useState } from 'react';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, Icon, DemoLabel, InfoBanner, RadioRow } from '../../../components';
import { colors, spacing } from '../../../theme';
import type { RootScreenProps } from '../../../navigation/types';
import { useSection } from './useCourses';
import { Routes } from '../../../navigation/routes';

/** Inferred supporting screen: the in-course quiz entry (Quiz 1 in Course Content). Attempts are local demo practice, not graded. */
export function CourseQuizScreen({ navigation, route }: RootScreenProps<'StudentCourseQuiz'>) {
  const { sectionId, materialId } = route.params;
  const section = useSection(sectionId);
  const material = section.data?.days.flatMap(d => d.materials).find(m => m.id === materialId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const questions = [
    { q: 'A genogram primarily maps…', opts: ['Family relationships across generations', 'Course grades', 'Room bookings'], a: 0 },
    { q: 'Recovery-oriented care emphasises…', opts: ['Punishment', 'Strengths and relational support', 'Isolation'], a: 1 },
    { q: 'Triangulation in a family system means…', opts: ['Three-sided debate', 'A third person is drawn into a two-person conflict', 'A seating plan'], a: 1 },
  ];
  const score = Object.entries(answers).filter(([i, v]) => questions[Number(i)].a === v).length;
  return (
    <Screen testID="course-quiz" header={<ScreenHeader backLabel="Course" />}>
      <Stack>
        <Text variant="displayMd">{material?.title ?? 'Quiz'}</Text>
        <Row><Pill label={section.data?.course.code ?? ''} tone="grey" small /><Pill label="In-course quiz · demo" tone="coral" small /></Row>
        <InfoBanner tone="grey" icon="Info" text="This demo quiz is practice only. Official marks for Quiz 1 are entered and released by your instructor under Grades & Progress." />
        {questions.map((item, i) => (
          <Card key={item.q} padding={spacing.md}>
            <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>{i + 1}. {item.q}</Text>
            <Stack gap={spacing.sm}>
              {item.opts.map((o, j) => <RadioRow key={o} selected={answers[i] === j} onPress={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))} label={o} description={submitted ? (j === item.a ? 'Correct answer' : undefined) : undefined} testID={`cq-${i}-${j}`} />)}
            </Stack>
          </Card>
        ))}
        {submitted ? (
          <Card tone="green"><Row gap={8}><Icon name="CircleCheck" size={20} color={colors.success600} /><Text variant="titleSm">{score} / {questions.length} correct (practice)</Text></Row></Card>
        ) : (
          <Button title="Submit practice attempt" onPress={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} disabledReason="Answer every question first" testID="cq-submit" />
        )}
        <Button title="Back to course" variant="outline" onPress={() => navigation.navigate(Routes.StudentCourseDetails, { sectionId })} />
        <DemoLabel text="Inferred supporting screen" />
      </Stack>
    </Screen>
  );
}
