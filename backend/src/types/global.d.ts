// Temporary type declarations to resolve TypeScript errors before npm install
declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
  export interface Response {
    [key: string]: any;
  }
  export interface NextFunction {
    (err?: any): void;
  }
  export interface Router {
    [key: string]: any;
  }
  export default function express(): any;
  export function Router(): Router;
}

declare module 'cors' {
  export default function cors(options?: any): any;
}

declare module 'helmet' {
  export default function helmet(options?: any): any;
}

declare module 'morgan' {
  export default function morgan(format: string, options?: any): any;
}

declare module 'express-rate-limit' {
  export default function rateLimit(options: any): any;
}

declare module 'dotenv' {
  export function config(): void;
}

declare module 'bcryptjs' {
  export function hash(data: string, rounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
}
