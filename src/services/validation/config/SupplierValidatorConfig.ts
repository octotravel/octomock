export class SupplierValidatorConfig {
  public supplierId: string;

  constructor({ supplierId }: { supplierId: string }) {
    this.supplierId = supplierId;
  }
}
