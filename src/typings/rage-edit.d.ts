declare module "rage-edit" {
  export function get(path: string, name: string): Promise<string>;
  export function has(path: string, name: string): Promise<boolean>;
  export function set(path: string, name: string, value: number): Promise<void>;
}
