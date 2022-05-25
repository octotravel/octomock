import { CapabilityId } from "@octocloud/types";

export type CapableToPOJOType = {
  useCapabilities?: boolean;
  capabilities?: CapabilityId[];
};
export interface Capable {
  toPOJO(data: CapableToPOJOType);
}
