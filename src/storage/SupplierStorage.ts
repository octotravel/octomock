import { Supplier } from "@octocloud/types";
import { BadRequestError } from "./../models/Error";
import { InMemoryStorage } from "./InMemoryStorage";

export class SupplierStorage implements InMemoryStorage<Supplier> {
  private suppliers: Supplier[] = [
    {
      id: "1",
      name: "octomock",
      endpoint: "https://api.ventrata.com/api-octo",
      contact: {
        website: null,
        email: null,
        telephone: null,
        address: null,
      },
    },
    {
      id: "2",
      name: "octo",
      endpoint: "https://api.ventrata.com/api-octo",
      contact: {
        website: null,
        email: null,
        telephone: null,
        address: null,
      },
    },
  ];
  public get(id: string): Nullable<Supplier> {
    let supplier: Nullable<Supplier> = null;
    if (id === "0") {
      supplier = this.suppliers[0] ?? null;
    } else {
      supplier = this.suppliers.find((p) => p.id === id) ?? null;
      if (supplier === null) {
        throw new BadRequestError("Invalid supplierId");
      }
    }
    return supplier;
  }
  public getAll(): Supplier[] {
    return this.suppliers;
  }
}
