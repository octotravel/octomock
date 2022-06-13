import { CapabilityId, Supplier } from "@octocloud/types";

export type ApiParams = {
    capabilities?: CapabilityId[];
    headers?: any;
    url: string;
}

export class ApiClient {
    public getSuppliers = async (params: ApiParams): Promise<Supplier[] | Error> => {
        const res = fetch(`${params.url}/suppliers`, {
            method: 'GET',
            headers: params.headers,
        }).then(response => response.json()).then(data => {
            console.log(data)
            return data;
        })
        return res;
    }
}