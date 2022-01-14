import { Knex } from 'knex';

export enum ClientType {
  'mssql',
  'mysql2',
  'pg',
}

export type CallbackFn = (e: unknown, data?: any) => void;

export interface TransportSqlOptions {
  client: keyof typeof ClientType;
  connection: any; //string | Knex.Config<any>;
  defaultMeta?: any;
  label?: string;
  level?: string;
  name?: string;
  tableName?: string;
}
