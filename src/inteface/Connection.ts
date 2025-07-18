export interface BaseConnection {
  id: string;
  name: string;
  type: string;
}

export interface GygConnection extends BaseConnection {
  gygConnectId: string;
  gygLoginEmail: string;
  gygLoginPassword: string;
  gygSupplierId: string;
  gygSupplierName: string;
  gygLoginOTPSecret: string;
  gygActivated: boolean;
}

export interface ExpediaConnection extends BaseConnection {
  expediaConnectId: string;
  expediaSupplierBranchId: string;
  expediaSupplierBranchName: string;
}

export interface ViatorConnection extends BaseConnection {
  viatorConnectId: string;
  viatorApiSupplierId: string;
  viatorSupplierCode: string;
  viatorSupplierName: string;
}

export type Connection = GygConnection | ExpediaConnection | ViatorConnection;
