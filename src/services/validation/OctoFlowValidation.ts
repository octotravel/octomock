import { CapabilityId, Supplier } from "@octocloud/types";
import { ApiClient, ApiParams } from "./ApiClient";

type Result<T> = {
    result: Nullable<T>;
    error: Nullable<Error>;
}
export class OctoFlowValidationService {
    private api = new ApiClient();
    private path = 'http://localhost:8787';
    private headers = [{
        "Authorization":`Bearer fareharbortest`,
    }];
    private capabilities = [CapabilityId.Pricing, CapabilityId.Content]

    private getSuppliers = async (params: ApiParams): Promise<Result<Supplier>> => {
        const data = await this.api.getSuppliers(params);
        console.log('data', data);
        return {
            result: null,
            error: null,
        }
    }

    public validateFlow = async (): Promise<void> => {
        const suppliers = this.getSuppliers({
            capabilities: this.capabilities,
            headers: this.headers,
            url: this.path,
        })
        console.log('suppliers', suppliers);
    }
}
