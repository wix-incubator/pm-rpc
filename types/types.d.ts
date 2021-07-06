export interface TargetDefinition {
  target?: MessagePort | Worker | Window | HTMLIFrameElement;
}

export declare type OnApiCall<T extends unknown[]> = (data: {
  appId: string;
  call: string;
  args: T;
}) => void;
