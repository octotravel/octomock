import { Supplier } from '@octocloud/types';
import { GygConnection } from 'storage/ConnectionStorage';
import { Reseller } from 'types/Reseller';

export interface WhoAmIAggregate {
  supplier: Nullable<Supplier>;
  connection: GygConnection;
  reseller: Reseller;
  partner: Record<string, any> | null;
  checkout: string | null;
  operator: string | null;
  terminal: string | null;
}
