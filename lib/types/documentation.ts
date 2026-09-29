export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'custom';

export interface Authentication {
  type: AuthType;
  details?: {
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    in?: 'header' | 'query';
    headerPrefix?: string;
  };
}

export interface Parameter {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  example?: unknown;
  default?: unknown;
  enum?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
}

export interface RequestBody {
  mode: 'raw' | 'formdata' | 'urlencoded' | 'file' | 'none';
  rawType?: 'json' | 'text' | 'xml' | 'html' | 'javascript';
  rawContent?: string;
  parameters?: Parameter[];
}

export interface ResponseHeader {
  key: string;
  value: string;
  description?: string;
}

export interface ResponseExample {
  id: string;
  name: string;
  statusCode: number;
  statusText?: string;
  headers?: ResponseHeader[];
  body?: string;
  bodyType?: 'json' | 'xml' | 'text' | 'html';
  description?: string;
}

export interface RequestExample {
  id: string;
  name: string;
  headers?: Record<string, string>;
  body?: string;
  description?: string;
}

export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  path: string;
  fullUrl?: string;
  authentication?: Authentication;
  headers: Parameter[];
  pathParameters: Parameter[];
  queryParameters: Parameter[];
  requestBody?: RequestBody;
  responses: ResponseExample[];
  requestExamples?: RequestExample[];
  curlSnippet?: string;
  httpSnippet?: string;
  tags?: string[];
  deprecated?: boolean;
}

export type SectionType = 'cover' | 'toc' | 'overview' | 'group' | 'endpoint' | 'custom';

export interface DocumentationSection {
  id: string;
  type: SectionType;
  title: string;
  description?: string;
  hidden?: boolean;
  children?: DocumentationSection[];
  endpoint?: Endpoint;
  customContent?: string; // Markdown or rich text
}

export interface DocumentationMetadata {
  title: string;
  subtitle?: string;
  version: string;
  author?: string;
  date?: string;
  companyName?: string;
  website?: string;
  logoUrl?: string;
  baseUrl?: string;
  description?: string;
}

export type CoverStyle = 'minimal' | 'modern' | 'corporate';
export type FontFamily = 'Google Sans' | 'Inter' | 'Roboto' | 'Outfit' | 'Roboto Mono' | 'Fira Code' | 'Merriweather';

export interface DocumentationTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  codeBackgroundColor: string;
  borderColor: string;
  fontFamily: FontFamily;
  codeFontFamily: string;
  borderRadius: string; // 'rounded-none' | 'rounded-md' | 'rounded-lg' | 'rounded-xl'
  coverStyle: CoverStyle;
}

export interface DocumentationVariable {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

export interface QualityFinding {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  targetId?: string; // Links to section or endpoint
  targetName?: string;
  field?: string;
}

export interface QualityReport {
  score: number; // 0 to 100
  totalEndpoints: number;
  endpointsWithDescriptions: number;
  endpointsWithMethods: number;
  endpointsWithRequestExamples: number;
  endpointsWithResponseExamples: number;
  missingDescriptionsCount: number;
  missingParametersCount: number;
  missingResponsesCount: number;
  findings: QualityFinding[];
}

export interface SecretFinding {
  id: string;
  type: 'bearer_token' | 'api_key' | 'basic_auth' | 'client_secret' | 'private_key' | 'password' | 'cookie';
  location: string;
  targetId?: string;
  targetName?: string;
  maskedValue: string;
  rawValue: string;
  isMasked: boolean;
}

export interface DocumentationProject {
  id: string;
  metadata: DocumentationMetadata;
  theme: DocumentationTheme;
  sections: DocumentationSection[];
  variables: DocumentationVariable[];
  qualityReport: QualityReport;
  secrets: SecretFinding[];
  createdAt: string;
  updatedAt: string;
}

