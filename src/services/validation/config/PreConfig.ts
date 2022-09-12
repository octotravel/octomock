export class PreConfig {
  public endpoint: string;
  public apiKey: string;
  public backendType: string;
  constructor({
    endpoint,
    apiKey,
    backendType,
  }: {
    endpoint: string;
    apiKey: string;
    backendType: string;
  }) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.backendType = backendType;
  }
}
