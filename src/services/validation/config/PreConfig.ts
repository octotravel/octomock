export class PreConfig {
  public url: string;
  public apiKey: string;
  public backendType: string;
  constructor({
    url,
    apiKey,
    backendType,
  }: {
    url: string;
    apiKey: string;
    backendType: string;
  }) {
    this.url = url;
    this.apiKey = apiKey;
    this.backendType = backendType;
  }
}
