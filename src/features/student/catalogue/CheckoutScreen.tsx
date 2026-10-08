import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, LoadingState, ErrorState, Icon, InfoBanner, DemoLabel, KeyValueRow, Select } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useProgramme, useCheckout, useEnrolments } from './useCatalogue';
import { formatMoney } from '../../../utils/format';
import { ServiceError } from '../../../services/errors';
import type { CheckoutOutcome } from '../../../services/contracts/learning';

/** Clearly labelled DEMO checkout: no card entry, no real processor, deterministic outcomes. */
export function CheckoutScreen({ navigation, route }: RootScreenProps<'StudentCheckout'>) {
  const { programmeId } = route.params;
  const programme = useProgramme(programmeId);
  const enrolments = useEnrolments();
  const checkout = useCheckout();
  const [outcome, setOutcome] = useState<CheckoutOutcome>('success');
  const alreadyEnrolled = enrolments.data?.some(e => e.programmeId === programmeId);
  const p = programme.data;
  const run = async () => {
    try {
      const res = await checkout.mutateAsync({ programmeId, outcome });
      if (res.enrolment) navigation.replace(Routes.StudentOutline, { programmeId });
    } catch {
      // error shown inline
    }
  };
  const err = checkout.error;
  return (
    <Screen testID="checkout-screen" header={<ScreenHeader title="Demo Checkout" backLabel="" />}>
      {programme.isLoading ? <LoadingState /> : !p ? <ErrorState error={programme.error} onRetry={() => programme.refetch()} /> : (
        <Stack>
          <View style={styles.center}>
            <View style={styles.shield}><Icon name="ShieldCheck" size={34} color={colors.green900} /></View>
            <Text variant="overline" color={colors.coral600}>Demo enrollment</Text>
            <Text variant="displayMd">Demo Payment</Text>
            <Text variant="body" align="center">This is a simulated checkout. No money is charged, no card details are collected, and no payment provider is contacted.</Text>
          </View>
          <Card>
            <Stack gap={spacing.sm}>
              <Row justify="space-between"><Pill label="Course purchase" tone="dark" small /><Row gap={4}><Icon name="GraduationCap" size={14} color={colors.green700} /><Text variant="caption">Heritage College</Text></Row></Row>
              <Text variant="titleMd">{p.title}</Text>
              <Row wrap><Pill label={p.category} tone="grey" small /><Pill label={p.level} tone="grey" small /><Pill label="Self-Paced" tone="grey" small /></Row>
              <KeyValueRow label="Course Tuition" value={formatMoney(p.priceCad)} />
              <KeyValueRow label="Registration & Exam Materials" value="Included" valueColor={colors.success600} />
              <KeyValueRow label="Tax (Exempt Educational Program)" value={formatMoney(0)} />
              <KeyValueRow label="Total Amount Due" value={formatMoney(p.priceCad)} border={false} />
              <DemoLabel text="DEMO · no funds move" />
            </Stack>
          </Card>
          <InfoBanner icon="Info" tone="green" title="Demo transfer" text="A real integration would hand off to a PCI-compliant payment provider. This demo records a local payment entry and enrolment only." />
          <Select label="Simulated outcome (demo control)" value={outcome} onChange={setOutcome} testID="checkout-outcome" options={[
            { value: 'success', label: 'Success — enrol and open the programme' },
            { value: 'cancel', label: 'Cancelled — return without enrolling' },
            { value: 'fail', label: 'Declined — retryable failure' },
          ]} />
          {err ? (
            <InfoBanner icon={ServiceError.is(err, 'CANCELLED') ? 'CircleX' : 'TriangleAlert'} tone={ServiceError.is(err, 'CANCELLED') ? 'grey' : 'coral'} title={ServiceError.is(err, 'CANCELLED') ? 'Checkout cancelled' : ServiceError.is(err, 'CONFLICT') ? 'Already enrolled' : 'Payment declined (simulated)'} text={err.message} />
          ) : null}
          {alreadyEnrolled ? (
            <Button title="Open your programme" onPress={() => navigation.replace(Routes.StudentOutline, { programmeId })} testID="checkout-open" />
          ) : (
            <Button title="Continue to demo payment →" variant="coral" onPress={run} loading={checkout.isPending} testID="checkout-continue" />
          )}
          {err && ServiceError.is(err, 'SERVER') ? <Button title="Retry payment" variant="outline" onPress={() => { setOutcome('success'); void run(); }} testID="checkout-retry" /> : null}
          <Button title="Cancel and return to course syllabus" variant="ghost" onPress={() => navigation.goBack()} testID="checkout-cancel" />
          <Text variant="caption" align="center">Demo institution • Instant access on simulated confirmation</Text>
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  shield: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green50, alignItems: 'center', justifyContent: 'center' },
});
