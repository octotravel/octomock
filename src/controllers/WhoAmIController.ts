import { Context } from 'koa';
import { ConnectionRepository } from 'repositories/ConnectionRepository';
import { ResellerRepository } from 'repositories/ResellerRepository';
import { SupplierRepository } from 'repositories/SupplierRepository';
import { WhoAmIAggregate } from 'types/WhoAmIAggregate';

interface IWhoAmIController {
  get: (ctx: Context) => Promise<void>;
}

export class WhoAmIController implements IWhoAmIController {
  private readonly resellerRepository = new ResellerRepository();
  private readonly supplierRepository = new SupplierRepository();
  private readonly connectionRepository = new ConnectionRepository();

  public get = async (ctx: Context): Promise<void> => {
    try {
      const authHeader = ctx.request.headers.authorization;

      if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: 'Authorization header is required' };
        return;
      }

      const apiKey = authHeader.replace('Bearer ', '');
      const supId = '1';
      const connectionId = '1';

      const reseller = this.resellerRepository.getReseller(apiKey);
      const supplier = this.supplierRepository.getSupplier(supId);
      const connection = this.connectionRepository.getConnection(connectionId);

      const response: WhoAmIAggregate = {
        reseller,
        supplier,
        connection,
        checkout: null,
        operator: null,
        partner: null,
        terminal: null,
      };

      ctx.status = 200;
      ctx.body = response;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'INTERNAL_SERVER_ERROR',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  };
}
