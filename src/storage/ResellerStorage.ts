import { Reseller } from "../types/Reseller";
import { InMemoryStorage } from "./InMemoryStorage";

export class ResellerStorage implements InMemoryStorage<Reseller> {
  public get(apiKey: string): Nullable<Reseller> {
    if ((Object.keys(Reseller) as string[]).includes(apiKey)) {
      return Reseller[apiKey as Reseller]
    }

    return null;
  }

  public getAll(): Reseller[] {
    return Object.values(Reseller);
  }
}
