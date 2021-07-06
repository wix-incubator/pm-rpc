import { OnApiCall, TargetDefinition } from './types';

/**
 * Set global api that will be consumed
 * @param {string} apiId Id of the api that will be requested
 * @param {object} api API that get exposed
 * @param {function} [options.onApiCall] Deprecated - callback when some api function is called
 * @param {Worker[]} [options.workers] - array of Workers that can consume API
 */
export declare const set: <T extends unknown>(
  apiId: string,
  api: T,
  options?: {
    onApiCall?: OnApiCall<unknown[]>;
    workers?: Worker[];
  },
) => void;

/**
 * Request API by apiId
 * @param {string} apiId Id of the api that will be requested
 * @param targetDef Definition of target. Can be MessagePort | Worker | Window | HTMLIFrameElement
 */
export declare const request: <T = unknown>(
  apiId: string,
  targetDef?: TargetDefinition,
) => Promise<T>;

/**
 * Remove API and for requests to it
 * @param apiId Id of the api
 */
export declare const unset: (apiId: string) => void;
