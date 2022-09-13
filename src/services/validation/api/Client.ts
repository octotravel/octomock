import { CapabilityId } from "@octocloud/types";
import { Result } from "./types";

interface FetchData {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: string;
}
export class Client {
  private capabilities: CapabilityId[];
  private apiKey: string;
  constructor({
    capabilities,
    apiKey,
  }: {
    capabilities?: CapabilityId[];
    url: string;
    apiKey: string;
  }) {
    this.capabilities = capabilities ?? [];
    this.apiKey = apiKey;
  }

  protected fetch = async <T>(data: FetchData): Promise<Result<T>> => {
    const { url, method = "GET", body } = data;
    const init: RequestInit = {
      method: method,
      headers: this.createHeaders(),
    };
    if (body) {
      init.body = body;
    }
    const res = await fetch(url, init);
    return this.setResponse({ url, body: body ?? null }, res);
  };

  private createHeaders = (): Record<string, string> => {
    const headers = {
      "Octo-Capabilities": this.capabilities.join(", "),
      Authorization: `Bearer ${this.apiKey}`,
      "content-type": "application/json",
    };

    return headers;
  };

  protected setResponse = async <T>(
    request: { url: string; body: Nullable<string> },
    response: Response
  ): Promise<Result<T>> => {
    const status = response.status;
    const requestBody = this.parseBody(request.body);
    const { data } = await this.parseResponse<T>(response);
    if (status === 200) {
      return {
        data,
        request: {
          url: request.url,
          body: requestBody,
        },
        response: {
          data: {
            status,
            body: data,
          },
          error: null,
        },
      };
    }
    try {
      return {
        data: null,
        request: {
          url: request.url,
          body: requestBody,
        },
        response: {
          data: null,
          error: {
            status: response.status,
            body: data as Record<string, unknown>,
          },
        },
      };
    } catch (e) {
      return {
        data: null,
        request: {
          url: request.url,
          body: requestBody,
        },
        response: {
          data: null,
          error: {
            status: response.status,
            body: response.statusText as any,
          },
        },
      };
    }
  };

  private parseBody = (
    body: Nullable<string>
  ): Nullable<Record<string, any>> => {
    if (body === null) {
      return null;
    }
    return JSON.parse(body);
  };

  private parseResponse = async <T>(
    response: Response
  ): Promise<{
    data: Nullable<T>;
    text: Nullable<string>;
    error: Nullable<Error>;
  }> => {
    try {
      const data = await response.clone().json();
      return { data, error: null, text: null };
    } catch (err) {
      const text = await response.text();
      return { data: null, text, error: new Error("invalid response format") };
    }
  };
}
