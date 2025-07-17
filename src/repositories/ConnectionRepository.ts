import { ConnectionStorage, GygConnection } from 'storage/ConnectionStorage';

interface IConnectionRepository {
  getConnection(id: string): GygConnection;
}

export class ConnectionRepository implements IConnectionRepository {
  private readonly storage = new ConnectionStorage();

  public getConnection(id: string) {
    return this.storage.getConnection(id);
  }
}
