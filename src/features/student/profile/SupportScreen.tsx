import React from 'react';
import { Linking } from 'react-native';
import { useAppNavigation } from '../../../navigation/hooks';
import { Screen, ScreenHeader, Text, Card, Stack, ListRow, DemoLabel, Button } from '../../../components';
import { spacing } from '../../../theme';
import { useSessionStore } from '../../../state/sessionStore';
import { Routes } from '../../../navigation/routes';

/** Inferred supporting screen reached from "Need Help? Contact Student Support". */
export function SupportScreen() {
  const navigation = useAppNavigation();
  const user = useSessionStore(s => s.user);
  return (
    <Screen header={<ScreenHeader title="Student Support" />} testID="support-screen">
      <Stack>
        <DemoLabel text="Inferred supporting screen · synthetic contacts" />
        <Card>
          <Text variant="displaySm">We're here to help</Text>
          <Text variant="body">Reach the right team for sign-in problems, records, finance, or wellbeing. Contact details below are synthetic demo values.</Text>
        </Card>
        <Card padding={spacing.md}>
          <ListRow icon="Mail" title="Email Student Support" subtitle="support@heritage.edu (demo)" onPress={() => Linking.openURL('mailto:support@heritage.edu?subject=Student%20support').catch(() => undefined)} />
          <ListRow icon="Phone" title="Call the help desk" subtitle="+1 (604) 555-0100 (demo)" onPress={() => Linking.openURL('tel:+16045550100').catch(() => undefined)} />
          <ListRow icon="KeyRound" title="Reset your password" subtitle="Mock reset request" onPress={() => navigation.navigate(Routes.ResetPassword)} />
          {user ? <ListRow icon="MessageSquare" title="Message Academic Advising" subtitle="Campus mail" onPress={() => navigation.navigate(Routes.MailCompose, { toId: 'c_advising', subject: 'Support request' })} /> : null}
        </Card>
        <Button title="Back" variant="outline" onPress={() => navigation.goBack()} />
      </Stack>
    </Screen>
  );
}
