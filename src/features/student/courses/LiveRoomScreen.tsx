import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, Icon, DemoLabel, LoadingState, Toggle } from '../../../components';
import { colors, spacing } from '../../../theme';
import type { RootScreenProps } from '../../../navigation/types';
import { useSection } from './useCourses';
import { useClockTick } from '../../shared/hooks';
import { formatTime } from '../../../utils/format';

/** Clearly marked DEMO live-class room. No conferencing backend exists; nothing is joined. */
export function LiveRoomScreen({ navigation, route }: RootScreenProps<'StudentLiveRoom'> | RootScreenProps<'InstructorLiveRoom'>) {
  const { sectionId, roomId } = route.params;
  const section = useSection(sectionId);
  const [joined, setJoined] = useState(false);
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const now = useClockTick(1000);
  const s = section.data;
  return (
    <Screen testID="live-room" header={<ScreenHeader title="Demo live room" subtitle={roomId} />}>
      {section.isLoading ? <LoadingState /> : (
        <Stack>
          <DemoLabel text="DEMO ROOM · no conferencing service · nothing is transmitted" />
          <Card tone="dark">
            <Stack gap={spacing.sm}>
              <Row justify="space-between"><Text variant="overline" color={colors.green100}>{s?.course.code} · {s?.sectionCode}</Text><Pill label={joined ? 'Joined (demo)' : s?.liveRoomReady ? 'Room ready' : 'Not open'} tone={joined ? 'green' : 'grey'} small dot /></Row>
              <Text variant="displaySm" color={colors.white}>{s?.course.title}</Text>
              <View style={styles.stage}>
                <Icon name={joined ? 'Users' : 'Video'} size={40} color={colors.green100} />
                <Text variant="bodySm" color={colors.green100} align="center">{joined ? `You are in the demo room · ${formatTime(new Date(now))}` : 'Join to enter the simulated classroom. No audio or video is captured.'}</Text>
              </View>
              {joined ? (
                <>
                  <Toggle label="Microphone (simulated)" value={mic} onChange={setMic} testID="room-mic" />
                  <Toggle label="Camera (simulated)" value={cam} onChange={setCam} testID="room-cam" />
                  <Button title="Leave demo room" variant="danger" onPress={() => { setJoined(false); navigation.goBack(); }} testID="room-leave" />
                </>
              ) : (
                <Button title="Join demo session" variant="coral" onPress={() => setJoined(true)} disabled={!s?.liveRoomReady} disabledReason="The instructor has not opened this room yet (demo state)." testID="room-join" />
              )}
            </Stack>
          </Card>
          <Text variant="caption">A production integration (e.g. BigBlueButton) would open the vendor's native or web client here. This screen only demonstrates the entry point and join state.</Text>
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ stage: { backgroundColor: colors.green800, borderRadius: 14, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg } });
