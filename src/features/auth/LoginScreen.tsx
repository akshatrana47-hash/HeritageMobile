import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Checkbox, Input, Screen, Text, InlineError, Row, DemoLabel, Icon } from '../../components';
import { colors, spacing } from '../../theme';
import { Wordmark } from './Brand';
import { useLogin } from './useAuth';
import { Routes } from '../../navigation/routes';
import type { RootScreenProps } from '../../navigation/types';
import { ServiceError } from '../../services/errors';
import { DEMO_PASSWORD } from '../../fixtures/constants';

const schema = z.object({
  loginId: z.string().trim().min(3, 'Enter your student number or instructor email'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function LoginScreen({ navigation, route }: RootScreenProps<'Login'>) {
  const [role, setRole] = useState<'student' | 'instructor'>(route.params?.role ?? 'student');
  const login = useLogin();
  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { loginId: '', password: '', rememberMe: true },
  });
  const onSubmit = handleSubmit(async values => {
    try {
      await login.mutateAsync(values);
    } catch (e) {
      if (ServiceError.is(e, 'UNAUTHENTICATED')) setError('password', { message: e.message });
    }
  });
  const isStudent = role === 'student';
  return (
    <Screen testID="login-screen" contentStyle={styles.content}>
      <View style={styles.brand}><Wordmark /></View>
      <Text variant="displayLg" align="center">Welcome back</Text>
      <Text variant="body" align="center">Enter your {isStudent ? 'student' : 'instructor'} credentials to continue where you left off.</Text>

      {/* Demo/developer control: role switch for the mock login. Not production authorization logic. */}
      <View style={styles.roleSwitch} accessibilityRole="tablist">
        {(['student', 'instructor'] as const).map(r => (
          <Pressable key={r} testID={`login-role-${r}`} accessibilityRole="tab" accessibilityState={{ selected: role === r }} onPress={() => setRole(r)} style={[styles.roleBtn, role === r ? styles.roleActive : null]}>
            <Text variant="label" color={role === r ? colors.white : colors.green900}>{r === 'student' ? 'Student' : 'Instructor'}</Text>
          </Pressable>
        ))}
      </View>
      <DemoLabel text="Demo role switch · mock sign-in" style={{ alignSelf: 'center' }} />

      <Controller control={control} name="loginId" render={({ field }) => (
        <Input testID="login-id" label={isStudent ? 'Student Number' : 'Instructor Email'} rightLabel={isStudent ? undefined : '@heritage.edu'} leftIcon={isStudent ? 'IdCard' : 'Mail'} placeholder={isStudent ? 'ST-2024-001' : 'username@heritage.edu'} autoCapitalize="none" autoCorrect={false} keyboardType={isStudent ? 'default' : 'email-address'} textContentType="username" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.loginId?.message} returnKeyType="next" />
      )} />
      <Controller control={control} name="password" render={({ field }) => (
        <Input testID="login-password" label="Password" leftIcon="Lock" placeholder="Enter your password" secure textContentType="oneTimeCode" autoComplete="off" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.password?.message} returnKeyType="go" onSubmitEditing={() => onSubmit()} />
      )} />
      <Row justify="space-between">
        <Controller control={control} name="rememberMe" render={({ field }) => <Checkbox testID="login-remember" checked={field.value} onChange={field.onChange} label="Remember me" />} />
        <Pressable testID="login-forgot" accessibilityRole="link" onPress={() => navigation.navigate(Routes.ResetPassword)} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text variant="label" color={colors.coral600}>Forgot password?</Text>
        </Pressable>
      </Row>
      {login.error && !ServiceError.is(login.error, 'UNAUTHENTICATED') ? <InlineError error={login.error} /> : null}
      <Button testID="login-submit" title="Sign In" size="lg" onPress={onSubmit} loading={login.isPending} />
      <Pressable accessibilityRole="link" onPress={() => navigation.navigate(Routes.StudentSupport)} style={styles.support} testID="login-support">
        <Text variant="label" color={colors.green900} style={{ textDecorationLine: 'underline' }}>Need Help? Contact {isStudent ? 'Student' : 'Instructor'} Support →</Text>
      </Pressable>
      <View style={styles.hint}>
        <Row gap={6}><Icon name="KeyRound" size={14} color={colors.gold600} /><Text variant="caption" color={colors.gold600}>Demo credentials</Text></Row>
        <Text variant="caption">Student: ST-2024-001 · Instructor: monica.dahiya@heritage.edu · Password: {DEMO_PASSWORD}</Text>
      </View>
      {__DEV__ ? <Button title="Developer gallery" variant="ghost" size="sm" fullWidth={false} onPress={() => navigation.navigate(Routes.DevGallery)} style={{ alignSelf: 'center' }} testID="login-dev-gallery" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingTop: spacing.xxl },
  brand: { alignItems: 'center', marginBottom: spacing.sm },
  roleSwitch: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: 999, padding: 4, alignSelf: 'center' },
  roleBtn: { paddingHorizontal: 22, minHeight: 36, borderRadius: 999, justifyContent: 'center' },
  roleActive: { backgroundColor: colors.green900 },
  support: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  hint: { backgroundColor: colors.gold50, padding: spacing.md, borderRadius: 12, gap: 4 },
});
