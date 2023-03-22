import { ResellerStorage } from "../storage/ResellerStorage";
import { Reseller } from "../types/Reseller";
interface IResellerRepository {
  getReseller(apiKey: string): Reseller | null;
}

export class ResellerRepository implements IResellerRepository {
  private storage = new ResellerStorage();

  public getReseller(apiKey: string): Reseller {
    const reseller = this.storage.get(apiKey);

    if (reseller === null) {
      throw new Error("Invalid reseller");
    }

    return reseller;
  }
}
