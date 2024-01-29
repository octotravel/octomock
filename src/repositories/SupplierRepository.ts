import { Supplier } from '@octocloud/types';
import { SupplierStorage } from '../storage/SupplierStorage';

interface ISupplierRepository {
  getSuppliers: () => Supplier[];
  getSupplier: (id: string) => Nullable<Supplier>;
}

export class SupplierRepository implements ISupplierRepository {
  private readonly storage = new SupplierStorage();

  public getSuppliers(): Supplier[] {
    return this.storage.getAll();
  }

  public getSupplier(id: string): Nullable<Supplier> {
    return this.storage.get(id);
  }
}
