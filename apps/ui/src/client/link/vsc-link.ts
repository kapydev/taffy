import { AnyTRPCRouter } from '@trpc/server';
import { createBaseLink } from './internal/base';
import { vscApi } from '../../common/vsc-api';
import { TRPCLink } from '@trpc/client';

export const vscLink = <TRouter extends AnyTRPCRouter>(): TRPCLink<TRouter> => {
  //TODO: fix types
  const messageListeners = new Map<any, any>();

  return createBaseLink({
    postMessage(message) {
      vscApi.postMessage(message);
    },
    addMessageListener(listener) {
      const wrappedListener = (ev: MessageEvent) => listener(ev.data);
      messageListeners.set(listener, wrappedListener);
      window.addEventListener('message', wrappedListener);
    },
    removeMessageListener(listener) {
      const wrappedListener = messageListeners.get(listener);
      if (wrappedListener) {
        window.removeEventListener('message', wrappedListener);
        messageListeners.delete(listener);
      }
    },
    addCloseListener(listener) {
      //TODO
      // const wrappedListener = () => listener();
      // closeListeners.set(listener, wrappedListener);
      // opts.port.onDisconnect.addListener(wrappedListener);
    },
    removeCloseListener(listener) {
      //TODO
      // const wrappedListener = closeListeners.get(listener);
      // if (wrappedListener) {
      //   opts.port.onDisconnect.removeListener(wrappedListener);
      //   closeListeners.delete(listener);
      // }
    },
  });
};
