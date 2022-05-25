import { SupplierStorage } from "./../storage/SupplierStorage";
import { Supplier } from "@octocloud/types";

interface ISupplierRepository {
  getSuppliers(): Supplier[];
  getSupplier(id: string): Supplier;
}

export class SupplierRepository implements ISupplierRepository {
  private storage = new SupplierStorage();
  public getSuppliers = (): Supplier[] => this.storage.getAll();

  public getSupplier = (id: string): Nullable<Supplier> => this.storage.get(id);
}
