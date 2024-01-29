import { CapabilityId } from '@octocloud/types';

export interface InMemoryStorage<T> {
  get: (id: string) => Nullable<T>;
  getAll: (capabilities: CapabilityId[]) => T[];
}
