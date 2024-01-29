import { Supplier } from '@octocloud/types';
import { SupplierRepository } from '../repositories/SupplierRepository';

interface ISupplierService {
  getSuppliers: () => Promise<Supplier[]>;
  getSupplier: (id: string) => Promise<Nullable<Supplier>>;
}

export class SupplierService implements ISupplierService {
  private readonly repository = new SupplierRepository();

  public getSuppliers = async (): Promise<Supplier[]> => this.repository.getSuppliers();

  public getSupplier = async (id: string): Promise<Nullable<Supplier>> => this.repository.getSupplier(id);
}
