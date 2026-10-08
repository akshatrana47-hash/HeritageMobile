import { appConfig } from '../config/appConfig';
import type { Services } from './contracts';
import { createMockServices } from './mock';
import { createHttpServices } from './http';
import { Repository } from '../storage/repository';
import { asyncStorageAdapter, KeyValueStore } from '../storage/asyncStorage';
import { buildSeed } from '../fixtures/seed';

export type { Services } from './contracts';

let repoSingleton: Repository | null = null;
let servicesSingleton: Services | null = null;

export function getRepository(): Repository {
  if (!repoSingleton) repoSingleton = new Repository({ store: asyncStorageAdapter, seed: buildSeed });
  return repoSingleton;
}

export function getServices(): Services {
  if (!servicesSingleton) {
    servicesSingleton = appConfig.mode === 'mock'
      ? createMockServices({ repo: getRepository(), sessionStore: asyncStorageAdapter })
      : createHttpServices(() => undefined);
  }
  return servicesSingleton;
}

/** Test helper: build an isolated service set on an in-memory store. */
export function createTestServices(store: KeyValueStore, sessionStore: KeyValueStore = store) {
  const repo = new Repository({ store, seed: buildSeed, persistDelayMs: 0 });
  return { repo, services: createMockServices({ repo, sessionStore }) };
}
