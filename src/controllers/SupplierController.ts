import { SupplierService } from "./../services/SupplierService";
import { Supplier } from "./../types/Supplier";

interface ISupplierController {
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier>;
}

export class SupplierController implements ISupplierController {
  private supplierService = new SupplierService();
  public getSuppliers = async (): Promise<Supplier[]> =>
    this.supplierService.getSuppliers();
  public getSupplier = async (id: string): Promise<Supplier> =>
    this.supplierService.getSupplier(id);
}
