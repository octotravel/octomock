import { Connection } from 'inteface/Connection';
import { ConnectionStorage } from 'storage/ConnectionStorage';

interface IConnectionRepository {
  getConnection(id: string): Connection;
}

export class ConnectionRepository implements IConnectionRepository {
  private readonly storage = new ConnectionStorage();

  public getConnection(id: string): Connection {
    return this.storage.getConnection(id);
  }
}
