export type RequestTab = "params" | "headers" | "body" | "auth" | "tests";
export type ResponseTab = "body" | "headers" | "cookies" | "timeline" | "tests";

export type AuthType = "none" | "bearer" | "basic" | "apikey";

export interface AuthConfig {
  type: AuthType;
  bearerToken: string;
  basicUsername: string;
  basicPassword: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
}

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestHistoryItem {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  name?: string;
}
