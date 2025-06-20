import type { Database as Sqlite3Database } from 'better-sqlite3';
import Database from 'better-sqlite3';

export class DB {
  private static instance: DB;

  private db: Sqlite3Database | null = null;

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }

  public async getDB(): Promise<Sqlite3Database> {
    if (this.db === null) {
      const db = new Database('database.db', {});

      this.db = db;
      await this.createTables();
    }

    return this.db;
  }

  private readonly createTables = async (): Promise<void> => {
    const db = await DB.getInstance().getDB();

    db.exec(`
      CREATE TABLE IF NOT EXISTS booking  (
        id TEXT NOT NULL PRIMARY KEY,
        status TEXT,
        createdAt DATE,
        resellerReference TEXT,
        supplierReference TEXT,
        data TEXT
      )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS \`order\`  (
      id TEXT NOT NULL PRIMARY KEY,
      status TEXT,
      supplierReference TEXT,
      data TEXT
    )
  `);
  };
}
