export interface ParsedSchemaProperty {
  name: string;
  type: string;
  format?: string;
  nullable: boolean;
  required: boolean;
  description?: string;
  example?: unknown;
  enum?: string[];
  items?: ParsedSchema;
  properties?: ParsedSchemaProperty[];
}

export interface ParsedSchema {
  type: string;
  properties: ParsedSchemaProperty[];
  required?: string[];
}

export interface ParsedParameter {
  name: string;
  in: "path" | "query";
  required: boolean;
  type: string;
  format?: string;
  default?: unknown;
  description?: string;
  example?: unknown;
  enum?: string[];
  maximum?: number;
  nullable?: boolean;
}

export interface ParsedRequestBody {
  required: boolean;
  contentType: string;
  schema: ParsedSchema;
}

export interface ParsedResponse {
  statusCode: string;
  description: string;
  schema?: ParsedSchema;
}

export interface ParsedEndpoint {
  operationId: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  tag: string;
  tagSlug: string;
  operationSlug: string;
  summary: string;
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responses: ParsedResponse[];
  security: { scheme: string; scopes: string[] }[];
}

export interface ParsedCategory {
  name: string;
  slug: string;
  endpoints: ParsedEndpoint[];
}

export interface ParsedData {
  info: {
    title: string;
    description: string;
    version: string;
  };
  serverUrl: string;
  categories: ParsedCategory[];
  endpoints: ParsedEndpoint[];
}
