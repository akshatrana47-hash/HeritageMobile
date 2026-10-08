import { z } from 'zod';

/**
 * Single validated configuration boundary.
 * `mode` decides whether the app talks to the persistent local mock repository
 * ("mock") or to a future HTTP backend ("api"). Nothing else in the app should
 * read environment values directly.
 */
const ConfigSchema = z.object({
  mode: z.enum(['mock', 'api']).default('mock'),
  apiBaseUrl: z.string().url().optional(),
  apiTimeoutMs: z.number().int().positive().default(15000),
  demo: z.object({
    /** Base simulated latency for mock service calls (ms). */
    latencyMs: z.number().int().min(0).default(350),
    /** Persisted storage schema version. Bump with a migration. */
    schemaVersion: z.number().int().positive().default(1),
    /** Enables the developer gallery / scenario controls. */
    devToolsEnabled: z.boolean().default(__DEV__ || true),
    attachmentMaxBytes: z.number().int().positive().default(10 * 1024 * 1024), // 10 MiB (from Assignment Details design)
    attachmentMaxCount: z.number().int().positive().default(1),
  }),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

// Values below are the demo defaults. A real build would inject these from
// react-native-config / build settings and validate them here.
const rawConfig = {
  mode: 'mock',
  apiBaseUrl: undefined,
  demo: {},
};

export const appConfig: AppConfig = ConfigSchema.parse(rawConfig);

export function isMockMode(): boolean {
  return appConfig.mode === 'mock';
}
