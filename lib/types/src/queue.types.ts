export enum EQueueRegistry {
  registryRequests = "registry.requests",
}

export enum ERegistryStoreKey {
  openApiDoc = "openapidoc",
}

export interface IRegistryRequest {
  host: string;
  port: string;
  service: string;
}

export interface IServiceRecord extends IRegistryRequest {
  alive: boolean;
}
