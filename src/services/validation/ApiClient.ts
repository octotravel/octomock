import { CapabilityId } from "@octocloud/types";
import 'isomorphic-fetch';


export type ApiParams = {
    capabilities?: CapabilityId[];
    headers?: any;
    url: string;
}

export class ApiClient {
    public getSuppliers = async (params: ApiParams): Promise<Response> => {
        const url = `${params.url}/suppliers/`;
        return fetch(url, {
            method:'GET',
            headers: params.headers,
        })
    }
}