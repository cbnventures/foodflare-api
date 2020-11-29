// Type definitions for claudia-api-builder 4.1.2
// Project: https://github.com/cbnventures/foodflare-api
// Definitions by: Jacky Liang <https://github.com/mrjackyliang>
// TypeScript Version: 3.9.7

declare module 'claudia-api-builder' {
  import {
    Context as LambdaContext,
    APIGatewayProxyEvent as ProxyEvent,
  } from 'aws-lambda';

  interface ConstructorOptions {
    logger?: Logger;
    prompter?: Prompter;
    mergeVars?: boolean;
    requestFormat?: 'AWS_PROXY' | 'CLAUDIA_API_BUILDER';
  }

  type Logger = (message?: unknown, ...messages: unknown[]) => void;

  type Prompter = (question: string) => Promise<void>;

  interface ApiConfig {
    version: number;
    routes: ApiConfigRoutes | {};
    corsHandlers?: boolean;
    corsHeaders?: string;
    corsMaxAge?: number;
    authorizers?: ApiConfigAuthorizers;
    binaryMediaTypes?: string[];
    customResponses?: ApiConfigCustomResponses;
  }

  interface ApiConfigRoutes {
    [name: string]: { [methods in ApiConfigRoutesMethods]: object };
  }

  type ApiConfigRoutesMethods = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';

  interface ApiConfigAuthorizers {
    [name: string]: RegisterAuthorizerOptions;
  }

  interface ApiConfigCustomResponses {
    [name: string]: SetGatewayResponseConfig;
  }

  type AddPostDeployStepFunction = (
    commandLineOptions: PostDeployOptions,
    lambdaProperties: PostDeployLambdaDetails,
    utils: PostDeployUtils,
  ) => Promise<object | string> | object | string;

  interface PostDeployOptions {
    [key: string]: undefined | string | string[] | number | boolean;
  }

  interface PostDeployLambdaDetails {
    name: string;
    alias: string;
    apiId: string;
    apiUrl: string;
    region: string;
    apiCacheReused: boolean;
  }

  interface PostDeployUtils {
    apiGatewayPromise: unknown;
    aws: unknown;
    Promise?: unknown;
  }

  type RegisterAuthorizerOptions =
    RegisterAuthorizerOptionsNameVer
    | RegisterAuthorizerOptionsArn
    | RegisterAuthorizerOptionsProviderARNs;

  interface RegisterAuthorizerOptionsNameVer extends RegisterAuthorizerOptionsOptional {
    lambdaName: string;
    lambdaVersion?: string | number | boolean;
  }

  interface RegisterAuthorizerOptionsArn extends RegisterAuthorizerOptionsOptional {
    lambdaArn: string;
  }

  interface RegisterAuthorizerOptionsProviderARNs extends RegisterAuthorizerOptionsOptional {
    providerARNs: string[];
  }

  interface RegisterAuthorizerOptionsOptional {
    headerName?: string;
    identitySource?: string;
    validationExpression?: string;
    credentials?: string;
    resultTtl?: number;
    type?: 'REQUEST' | 'TOKEN' | 'COGNITO_USER_POOLS';
  }

  type SetGatewayResponseType =
    'ACCESS_DENIED'
    | 'API_CONFIGURATION_ERROR'
    | 'AUTHORIZER_CONFIGURATION_ERROR'
    | 'AUTHORIZER_FAILURE'
    | 'BAD_REQUEST_PARAMETERS'
    | 'BAD_REQUEST_BODY'
    | 'DEFAULT_4XX'
    | 'DEFAULT_5XX'
    | 'EXPIRED_TOKEN'
    | 'INTEGRATION_FAILURE'
    | 'INTEGRATION_TIMEOUT'
    | 'INVALID_API_KEY'
    | 'INVALID_SIGNATURE'
    | 'MISSING_AUTHENTICATION_TOKEN'
    | 'QUOTA_EXCEEDED'
    | 'REQUEST_TOO_LARGE'
    | 'RESOURCE_NOT_FOUND'
    | 'THROTTLED'
    | 'UNAUTHORIZED'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'WAF_FILTERED';

  interface SetGatewayResponseConfig {
    statusCode?: number | string;
    headers?: { [name: string]: string };
    responseParameters?: { [name: string]: string };
    responseTemplates?: { [name: string]: string };
    defaultResponse?: boolean;
  }

  type Request = (request: RequestClaudiaApiBuilder | ProxyEvent) => Promise<object | string> | object | string;

  interface RequestClaudiaApiBuilder {
    v: number;
    rawBody: string;
    normalizedHeaders: { [name: string]: string };
    lambdaContext: LambdaContext;
    proxyRequest: ProxyEvent;
    queryString: { [name: string]: string } | {};
    env: { [name: string]: string };
    headers: { [name: string]: string };
    pathParams: { [name: string]: string } | {};
    body: string;
    context: RequestClaudiaApiBuilderContext;
  }

  interface RequestClaudiaApiBuilderContext {
    method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';
    path: string;
    stage: string;
    sourceIp: string;
    accountId: string | null;
    user: string | null;
    userAgent: string | null;
    userArn: string | null;
    caller: string | null;
    apiKey?: string;
    authorizerPrincipalId: string | null;
    cognitoAuthenticationProvider: string | null;
    cognitoAuthenticationType: string | null;
    cognitoIdentityId: string | null;
    cognitoIdentityPoolId: string | null;
  }

  interface ProxyEventTest {
    body: string,
    requestContext: {
      resourcePath: string;
      httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
      identity: {
        sourceIp: string;
        userAgent: string;
      };
    };
  }

  interface Options {
    error?: number | {
      code?: number;
      contentType?: string;
      headers?: { [name: string]: string };
    };
    success?: number | {
      code?: number;
      contentType?: string;
      headers?: { [name: string]: string };
      contentHandling?: 'CONVERT_TO_BINARY' | 'CONVERT_TO_TEXT';
    };
    apiKeyRequired?: boolean;
    authorizationType?: 'AWS_IAM';
    invokeWithCredentials?: boolean | string;
    cognitoAuthorizer?: string;
    authorizationScopes?: string[];
    customAuthorizer?: string;
    requestContentHandling?: 'CONVERT_TO_BINARY' | 'CONVERT_TO_TEXT';
    requestParameters?: {
      querystring?: object;
      header?: object;
    };
  }

  function ApiResponse(body: string | object, header: object, httpCode: number);

  class ApiBuilder {
    public constructor(options?: ConstructorOptions);

    public apiConfig(): ApiConfig;

    public corsOrigin(handler?: Request | string): void;

    public corsHeaders(headers: string): void;

    public corsMaxAge(age: number): void;

    // Usage: "new ApiBuilder.ApiResponse".
    public static ApiResponse: typeof ApiResponse;

    // Usage: "new api.ApiResponse".
    public ApiResponse: typeof ApiResponse; // Depreciated.

    public intercept(callback: Request): void;

    public proxyRouter(event: ProxyEvent | ProxyEventTest, context: LambdaContext, callback?: Function): Promise<object | string>;

    public router(event: ProxyEvent | ProxyEventTest, context: LambdaContext, callback?: Function): Promise<object | string>; // Depreciated.

    public addPostDeployStep(stepName: string, stepFunction: AddPostDeployStepFunction): void;

    public addPostDeployConfig(stageVarName: string, prompt: string, configOption: string): void;

    public registerAuthorizer(name: string, options: RegisterAuthorizerOptions): void;

    public setBinaryMediaTypes(types?: string[] | boolean): void;

    public setGatewayResponse(responseType: SetGatewayResponseType, config: SetGatewayResponseConfig): void;

    public any(uri: string, callback: Request, options?: Options): void;

    public get(uri: string, callback: Request, options?: Options): void;

    public post(uri: string, callback: Request, options?: Options): void;

    public put(uri: string, callback: Request, options?: Options): void;

    public delete(uri: string, callback: Request, options?: Options): void;

    public head(uri: string, callback: Request, options?: Options): void;

    public patch(uri: string, callback: Request, options?: Options): void;
  }

  export = ApiBuilder;
}
