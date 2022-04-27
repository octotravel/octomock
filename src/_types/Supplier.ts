export interface Supplier {
  id: string;
  name: string;
  endpoint: string;
  contact: SupplierContact;
}

interface SupplierContact {
  website: Nullable<string>;
  email: Nullable<string>;
  telephone: Nullable<string>;
  address: Nullable<string>;
}
