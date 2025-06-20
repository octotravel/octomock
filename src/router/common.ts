import { CapabilityId } from '@octocloud/types';
import { Context } from 'koa';

export const getCapabilities = (ctx: Context): CapabilityId[] => ctx.capabilities as CapabilityId[];
