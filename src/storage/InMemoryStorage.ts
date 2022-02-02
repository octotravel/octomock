import { CapabilityId } from "./../types/Capability";

export interface InMemoryStorage<T> {
  get(id: string): Nullable<T>;
  getAll(capabilities: CapabilityId[]): T[];
}
