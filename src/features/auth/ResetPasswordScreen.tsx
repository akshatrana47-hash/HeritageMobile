import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Screen, Text, InlineError, Card, Icon, DemoLabel } from '../../components';
import { colors, spacing } from '../../theme';
import { Wordmark } from './Brand';
import { useRequestPasswordReset } from './useAuth';
import type { RootScreenProps } from '../../navigation/types';
import { formatDateTime } from '../../utils/format';

const schema = z.object({
  studentNumber: z.string().trim().min(3, 'Enter your student number'),
  email: z.string().trim().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export function ResetPasswordScreen({ navigation }: RootScreenProps<'ResetPassword'>) {
  const reset = useRequestPasswordReset();
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { studentNumber: '', email: '' } });
  const onSubmit = handleSubmit(v => reset.mutate(v));
  return (
    <Screen testID="reset-screen" contentStyle={styles.content}>
      <View style={styles.brand}><Wordmark /></View>
      <Text variant="displayLg" align="center">Reset Password</Text>
      <Text variant="body" align="center">Enter your student ID and university email on file to receive a secure password recovery link.</Text>
      {reset.data ? (
        <Card tone="green" testID="reset-success">
          <View style={{ gap: spacing.sm }}>
            <Icon name="MailCheck" size={28} color={colors.green900} />
            <Text variant="titleSm">Mock reset request recorded</Text>
            <Text variant="bodySm">No email was sent. This demo created a local request (ID {reset.data.requestId}) at {formatDateTime(reset.data.createdAt)}. A real backend would email a recovery link.</Text>
            <DemoLabel text="DEMO · no email sent" />
          </View>
        </Card>
      ) : (
        <>
          <Controller control={control} name="studentNumber" render={({ field }) => (
            <Input testID="reset-student" label="Student number" placeholder="ST-2024-001" rightIcon="IdCard" autoCapitalize="characters" autoCorrect={false} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.studentNumber?.message} />
          )} />
          <Controller control={control} name="email" render={({ field }) => (
            <Input testID="reset-email" label="Registered email" placeholder="marcus.vance@heritage.edu" rightIcon="Mail" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.email?.message} />
          )} />
          <InlineError error={reset.error} />
          <Button testID="reset-submit" title="Send reset link" size="lg" onPress={onSubmit} loading={reset.isPending} />
        </>
      )}
      <Pressable accessibilityRole="link" onPress={() => navigation.goBack()} style={styles.back} testID="reset-back">
        <Text variant="label" color={colors.green900} style={{ textDecorationLine: 'underline' }}>Back to sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingTop: spacing.xxl },
  brand: { alignItems: 'center', marginBottom: spacing.sm },
  back: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});
