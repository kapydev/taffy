import type {
    TRPCClientOutgoingMessage,
    TRPCErrorResponse,
    TRPCRequest,
    TRPCResultMessage,
  } from '@trpc/server/rpc';
  
  export type TRPCVscRequest = {
    trpc: TRPCRequest | TRPCClientOutgoingMessage;
  };
  
  export type TRPCVscSuccessResponse = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trpc: TRPCResultMessage<any>;
  };
  
  export type TRPCVscErrorResponse = {
    trpc: TRPCErrorResponse;
  };
  
  export type TRPCVscResponse = TRPCVscSuccessResponse | TRPCVscErrorResponse;
  
  export type TRPCVscMessage = TRPCVscRequest | TRPCVscResponse;
  export type RelayedTRPCMessage = TRPCVscMessage & { relayed?: true };
  
  export interface MinimalWindow
    extends Pick<Window, 'postMessage' | 'addEventListener' | 'removeEventListener'> {
    opener?: MinimalWindow;
  }
  
  export type MinimalPopupWindow = Pick<Window, 'postMessage' | 'closed'> &
    // addEventListener/removeEventListener are only available on the same origin
    Partial<Pick<Window, 'addEventListener' | 'removeEventListener'>>;
  
  export interface MessengerMethods {
    postMessage: (message: TRPCVscMessage) => void;
    addMessageListener: (listener: (message: TRPCVscMessage) => void) => void;
    removeMessageListener: (listener: (message: TRPCVscMessage) => void) => void;
    addCloseListener: (listener: () => void) => void;
    removeCloseListener: (listener: () => void) => void;
  }