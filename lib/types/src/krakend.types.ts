export enum EKrakendHttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  CONNECT = "CONNECT",
  TRACE = "TRACE",
}

export interface IKrakendBackend {
  allow?: string[];
  deny?: string[];
  disable_host_sanitize?: boolean;
  encoding?: string;
  extra_config?: object;
  group?: string;
  host?: string[];
  input_headers?: string[];
  input_query_strings?: string[];
  is_collection?: boolean;
  method?: EKrakendHttpMethod;
  sd?: "static" | "dns" | "dns-shared";
  sd_scheme?: "http" | "https";
  target?: string;
  url_pattern: string;
}

export interface IKrakendConfig {
  endpoints: IKrakendEndpoint;
  version: number;
}

export interface IKrakendEndpoint {
  backend: IKrakendBackend[];
  cache_ttl?: string;
  concurrent_calls?: number;
  endpoint: string;
  extra_config?: object;
  input_headers?: string[];
  input_query_strings?: string[];
  method?: EKrakendHttpMethod;
  output_encoding?:
    | "json"
    | "json-collection"
    | "yaml"
    | "fast-json"
    | "xml"
    | "negotiate"
    | "string"
    | "no-op";
  timeout?: string;
}
