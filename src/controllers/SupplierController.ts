import { Supplier } from '@octocloud/types';
import { SupplierService } from '../services/SupplierService';

interface ISupplierController {
  getSuppliers: () => Promise<Supplier[]>;
  getSupplier: (id: string) => Promise<Supplier>;
}

export class SupplierController implements ISupplierController {
  private readonly supplierService = new SupplierService();

  public getSuppliers = async (): Promise<Supplier[]> => await this.supplierService.getSuppliers();

  public getSupplier = async (): Promise<Supplier> => {
    const suppliers = await this.supplierService.getSuppliers();
    return suppliers[0];
  };
}
