import { Connection } from 'inteface/Connection';
import { BadRequestError } from '../models/Error';

export class ConnectionStorage {
  private suppliers: Connection[] = [
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
    {
      id: '2',
      name: 'Expedia',
      type: 'Expedia',
      expediaConnectId: '2',
      expediaSupplierBranchId: '',
      expediaSupplierBranchName: '',
    },
    {
      id: '3',
      name: 'Viator',
      type: 'Viator',
      viatorConnectId: '3',
      viatorApiSupplierId: '',
      viatorSupplierCode: '',
      viatorSupplierName: '',
    },
  ];

  public getConnection(id: string): Connection {
    const connection = this.suppliers.find((connection) => connection.id === id) ?? null;

    if (connection === null) {
      throw new BadRequestError('Invalid connectionId');
    }

    return connection;
  }
}
