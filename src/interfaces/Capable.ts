import { CapabilityId } from "./../types/Capability";

export type CapableToPOJOType = {
  useCapabilities?: boolean;
  capabilities?: CapabilityId[];
};
export interface Capable {
  toPOJO(data: CapableToPOJOType);
}
