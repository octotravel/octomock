import { BadRequestError } from '../models/Error';

export interface GygConnection {
  id: string;
  name: string;
  type: string;
  gygConnectId: string;
  gygLoginEmail: string;
  gygLoginPassword: string;
  gygSupplierId: string;
  gygSupplierName: string;
  gygLoginOTPSecret: string;
  gygActivated: boolean;
}

export class ConnectionStorage {
  private suppliers: GygConnection[] = [
    {
      id: '1',
      name: 'GYG Bangkok',
      type: 'GETYOURGUIDE',
      gygConnectId: '1',
      gygLoginEmail: '',
      gygLoginPassword: '',
      gygLoginOTPSecret: '',
      gygSupplierId: 'Gyg',
      gygSupplierName: 'Gyg',
      gygActivated: true,
    },
  ];

  public getConnection(id: string): GygConnection {
    const connection = this.suppliers.find((connection) => connection.id === id) ?? null;

    if (connection === null) {
      throw new BadRequestError('Invalid connectionId');
    }

    return connection;
  }
}
