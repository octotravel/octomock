import { CapabilityId } from "@octocloud/types";

export const getCapabilities = (ctx: any): CapabilityId[] => {
  return ctx.capabilities as CapabilityId[];
};
