import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export class DB {
  private static instance: DB;

  private db!: Database<sqlite3.Database, sqlite3.Statement>;

  private constructor() {
    //
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }

  public open = async (): Promise<void> => {
    const db = await open({
      filename: "./database.db",
      driver: sqlite3.cached.Database,
    });

    this.db = db;
    await this.createTables();
  };

  public getDB = (): Database<sqlite3.Database, sqlite3.Statement> => this.db;

  private createTables = async () => {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS booking  (
        id TEXT NOT NULL PRIMARY KEY,
        status TEXT,
        createdAt DATE,
        resellerReference TEXT,
        supplierReference TEXT,
        data TEXT
      )
  `);

    await this.db.exec(`
    CREATE TABLE IF NOT EXISTS \`order\`  (
      id TEXT NOT NULL PRIMARY KEY,
      status TEXT,
      supplierReference TEXT,
      data TEXT
    )
  `);
  };
}
