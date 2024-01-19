export interface TargetDefinition {
  target?: MessagePort | Worker | Window | HTMLIFrameElement;
}

export declare type OnApiCall<T extends unknown[]> = (data: {
  appId: string;
  call: string;
  args: T;
}) => void;

export declare type OnApiSettled<T extends unknown[]> = (data: {
  appId: string;
  call: string;
  args: T;
  onApiCallResult: any;
}) => void;
