import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenHeader, EmptyState, Button } from '../../components';
import { useSessionStore } from '../../state/sessionStore';
import { canAccess } from '../../navigation/permissions';
import type { RouteName } from '../../navigation/routes';
import { useSettings } from '../auth/useAuth';

export function ForbiddenView({ reason }: { reason?: string }) {
  const navigation = useNavigation();
  return (
    <Screen scroll={false} header={<ScreenHeader title="Not available" />} testID="forbidden-screen">
      <EmptyState icon="ShieldAlert" title="You can't open this screen" message={reason ?? 'This screen is not available for your role.'} />
      <Button title="Go back" variant="outline" onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)} testID="forbidden-back" />
    </Screen>
  );
}

/**
 * Wraps a screen with role/capability enforcement using centralised permission
 * metadata. Forbidden navigation renders an explanatory screen instead of data.
 */
export function withRoleGate<P extends object>(route: RouteName, Component: React.ComponentType<P>): React.ComponentType<P> {
  return function Gated(props: P) {
    const user = useSessionStore(s => s.user);
    const settings = useSettings();
    const check = canAccess(route, user, settings.data);
    if (!check.ok) return <ForbiddenView reason={check.reason} />;
    return <Component {...props} />;
  };
}
