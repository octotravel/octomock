import { CapabilityId } from '@octocloud/types';

export const getCapabilities = (ctx: any): CapabilityId[] => ctx.capabilities as CapabilityId[];
