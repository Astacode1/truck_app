// Temporary type declarations for frontend packages before npm install
declare module 'react' {
  export interface ReactNode {}
  export interface Component<P = {}, S = {}> {}
  export interface FunctionComponent<P = {}> {
    (props: P): ReactNode;
  }
  export const StrictMode: FunctionComponent<{ children: ReactNode }>;
  export default React;
  export namespace React {
    export interface ReactNode {}
  }
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: React.ReactNode): void;
  }
  export function createRoot(container: Element): Root;
}

declare module 'react-router-dom' {
  export const BrowserRouter: React.FunctionComponent<{ children: React.ReactNode }>;
  export const Routes: React.FunctionComponent<{ children: React.ReactNode }>;
  export const Route: React.FunctionComponent<{ path: string; element: React.ReactNode }>;
  export const Link: React.FunctionComponent<{ to: string; className?: string; children: React.ReactNode }>;
  export function useLocation(): { pathname: string };
}

declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(options?: any);
  }
  export const QueryClientProvider: React.FunctionComponent<{ client: QueryClient; children: React.ReactNode }>;
}

declare module 'axios' {
  export default function axios(config: any): Promise<any>;
}

declare module 'zustand' {
  export function create<T>(fn: (set: any, get: any) => T): () => T;
}

// CSS modules
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
