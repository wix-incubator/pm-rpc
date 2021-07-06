export interface TargetDefinition {
  target?: MessagePort | Worker | Window | HTMLIFrameElement;
}

export declare type OnApiCall = (data: {
  appId: string;
  call: string;
  args: any[];
}) => void;

/**
 * Set global api that will be consumed
 * @param {string} apiId Id of the api that will be requested
 * @param {object} api API that get exposed
 * @param {function} onApiCall Deprecated - callback when some api function is called
 * @param workers - array of Workers that can consume API
 */
export declare const set: <T extends unknown>(
  apiId: string,
  api: T,
  {
    onApiCall,
    workers,
  }?: {
    onApiCall?: OnApiCall | undefined;
    workers?: Worker[] | undefined;
  },
) => void;
/**
 * Request API by apiId
 * @param {string} apiId Id of the api that will be requested
 * @param targetDef Definition of target. Can be MessagePort | Worker | Window | HTMLIFrameElement
 */
export declare const request: (
  apiId: string,
  targetDef?: TargetDefinition,
) => void;
/**
 * Remove API and for requests to it
 * @param apiId Id of the api
 */
export declare const unset: (apiId: string) => void;
