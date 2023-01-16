import { SupplierStorage } from "./../storage/SupplierStorage";
import { Supplier } from "@octocloud/types";

interface ISupplierRepository {
  getSuppliers(): Supplier[];
  getSupplier(id: string): Nullable<Supplier>;
}

export class SupplierRepository implements ISupplierRepository {
  private storage = new SupplierStorage();
  public getSuppliers(): Supplier[] {
    return this.storage.getAll();
  }

  public getSupplier(id: string): Nullable<Supplier> {
    return this.storage.get(id);
  }
}
