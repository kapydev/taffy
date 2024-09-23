import { AnyTRPCRouter } from '@trpc/server';
import { createBaseLink } from './internal/base';
import { vscApi } from '../../common/vsc-api';
import { TRPCLink } from '@trpc/client';

export const vscLink = <TRouter extends AnyTRPCRouter>(): TRPCLink<TRouter> => {
  return createBaseLink({
    postMessage(message) {
      vscApi.postMessage(message);
    },
    addMessageListener(listener) {
      //   opts.port.onMessage.addListener(listener);
    },
    removeMessageListener(listener) {
      //   opts.port.onMessage.removeListener(listener);
    },
    addCloseListener(listener) {
      //   opts.port.onDisconnect.addListener(listener);
    },
    removeCloseListener(listener) {
      //   opts.port.onDisconnect.removeListener(listener);
    },
  });
};
