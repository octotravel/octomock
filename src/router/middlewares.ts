import Koa from "koa";
import { CapabilityId } from "@octocloud/types";

export async function parseCapabilities(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const capabilities: string = ctx.get("Octo-Capabilities") ?? "";
  ctx.capabilities = capabilities.split(",") as CapabilityId[];
  await next();
}
