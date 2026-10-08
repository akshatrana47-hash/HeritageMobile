/**
 * Route → screen component registry. Importing screens through one module keeps
 * the navigators thin and makes the developer gallery trivial to build.
 */
import type React from 'react';
import { Routes, RouteName } from './routes';
import { PlaceholderScreen } from '../features/shared/PlaceholderScreen';
import { ForbiddenView } from '../features/shared/RoleGate';
import { LoginScreen } from '../features/auth/LoginScreen';
import { ResetPasswordScreen } from '../features/auth/ResetPasswordScreen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyScreen = React.ComponentType<any>;

const registry: Partial<Record<RouteName, AnyScreen>> = {
  [Routes.Login]: LoginScreen,
  [Routes.ResetPassword]: ResetPasswordScreen,
  [Routes.Forbidden]: ForbiddenView,
};

export function screenFor(route: RouteName): AnyScreen {
  return registry[route] ?? PlaceholderScreen;
}

export function registerScreens(entries: Partial<Record<RouteName, AnyScreen>>) {
  Object.assign(registry, entries);
}

/** Root-stack routes (everything except tab shells and Splash). */
export const rootStackRoutes: RouteName[] = (Object.values(Routes) as RouteName[]).filter(r =>
  ![Routes.Splash, Routes.StudentTabs, Routes.InstructorTabs, Routes.StudentHomeTab, Routes.StudentCoursesTab, Routes.StudentScheduleTab, Routes.StudentMessagesTab, Routes.StudentProfileTab, Routes.InstructorHomeTab, Routes.InstructorCoursesTab, Routes.InstructorGradesTab, Routes.InstructorMessagesTab, Routes.InstructorMoreTab, Routes.Login, Routes.ResetPassword].includes(r as never),
);
