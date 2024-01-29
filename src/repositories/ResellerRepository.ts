import { BadRequestError } from '../models/Error';
import { ResellerStorage } from '../storage/ResellerStorage';
import { Reseller } from '../types/Reseller';

interface IResellerRepository {
  getReseller: (apiKey: string) => Reseller | null;
}

export class ResellerRepository implements IResellerRepository {
  private readonly storage = new ResellerStorage();

  public getReseller(apiKey: string): Reseller {
    const reseller = this.storage.get(apiKey);

    if (reseller === null) {
      throw new BadRequestError('Invalid reseller');
    }

    return reseller;
  }
}
