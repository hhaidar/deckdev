/* eslint-disable camelcase */
declare module "awesome-debounce-promise" {
  export interface Options {
    /**
     * One distinct debounced function is created per key and added to an internal cache
     * By default, the key is null, which means that all the calls
     * will share the same debounced function
     */
    key?: (...args: any[]) => null | string;
    /**
     * By default, a debounced function will only resolve
     * the last promise it returned
     * Former calls will stay unresolved, so that you don't have
     * to handle concurrency issues in your code
     * Setting this to false means all returned promises will resolve to the last result
     *
     * **Default**: `true`
     */
    onlyResolvesLast?: boolean;
  }
  export type PromiseProducer = (...args: any[]) => Promise<any>;
  export type AwesomeDebouncePromiseStatic = <P extends PromiseProducer>(
    fn: P,
    interval_ms: number,
    options?: Options
  ) => P;
  const AwesomeDebouncePromiseStatic: AwesomeDebouncePromiseStatic;
  export default AwesomeDebouncePromiseStatic;
}
