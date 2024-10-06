import { TRPCVscResponse } from '@taffy/shared-types';
import {
  AnyTRPCProcedure,
  AnyTRPCRouter,
  getErrorShape,
  TRPCError,
} from '@trpc/server';
import type { NodeHTTPCreateContextOption } from '@trpc/server/adapters/node-http';
import type { Unsubscribable } from '@trpc/server/observable';
import { isObservable } from '@trpc/server/observable';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';
import { isTRPCRequestWithId } from '@taffy/shared-helpers';
import * as vscode from 'vscode';
import { getErrorFromUnknown } from './errors';

const logger = console;

//Inspired by https://github.com/janek26/trpc-browser?tab=readme-ov-file#createchromehandleroptions
type CreateContextOptions = { req: unknown; res: unknown };
type CreateHandlerOptions<
  TRouter extends AnyTRPCRouter,
  TContextOptions extends CreateContextOptions,
  TOptions = Record<never, never>
> = Pick<
  HTTPBaseHandlerOptions<TRouter, TContextOptions['req']> &
    NodeHTTPCreateContextOption<
      TRouter,
      TContextOptions['req'],
      TContextOptions['res']
    >,
  'router' | 'createContext' | 'onError'
> &
  TOptions & {
    panel: vscode.WebviewPanel;
    context: vscode.ExtensionContext;
  };

export function createVscExtHandler<TRouter extends AnyTRPCRouter>(
  opts: CreateHandlerOptions<TRouter, { req: undefined; res: undefined }, {}>
) {
  const { panel, context, router, createContext, onError } = opts;
  const { transformer } = router._def._config;

  const subscriptions = new Map<number | string, Unsubscribable>();
  const listeners: (() => void)[] = [];

  const cleanup = () => listeners.forEach((unsub) => unsub());
  context.subscriptions.push({ dispose: cleanup });

  const onMessage = async (message: unknown) => {
    if (!isTRPCRequestWithId(message)) return;

    const { trpc } = message;
    const sendResponse = (response: TRPCVscResponse['trpc']) => {
      panel.webview.postMessage({
        trpc: { id: trpc.id, jsonrpc: trpc.jsonrpc, ...response },
      } as TRPCVscResponse);
    };

    if (trpc.method === 'subscription.stop') {
      subscriptions.get(trpc.id)?.unsubscribe();
      subscriptions.delete(trpc.id);
      return sendResponse({ result: { type: 'stopped' } });
    }
    const { method, params, id } = trpc;

    const ctx = await createContext?.({
      req: undefined,
      res: undefined,
      info: {} as any,
    });
    const handleError = (cause: unknown) => {
      const error = getErrorFromUnknown(cause);

      onError?.({
        error,
        type: method,
        path: params.path,
        input: params.input,
        ctx,
        req: undefined,
      });

      sendResponse({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: getErrorShape({
          config: router._def._config,
          error,
          type: method,
          path: params.path,
          input: params.input,
          ctx,
        }),
      });
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const input = transformer.input.deserialize(trpc.params.input);
      const caller = router.createCaller(ctx);

      const procedureFn = trpc.params.path
        .split('.')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        .reduce(
          (acc, segment) => acc[segment],
          caller as any
        ) as AnyTRPCProcedure;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await procedureFn(input as any);
      if (trpc.method !== 'subscription') {
        return sendResponse({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          result: {
            type: 'data',
            data: transformer.output.serialize(result),
          },
        });
      }

      if (!isObservable(result)) {
        throw new TRPCError({
          message: `Subscription ${params.path} did not return an observable`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const subscription = result.subscribe({
        next: (data) => {
          const serializedData = transformer.output.serialize(data);
          sendResponse({ result: { type: 'data', data: serializedData } });
        },
        error: handleError,
        complete: () => sendResponse({ result: { type: 'stopped' } }),
      });

      if (subscriptions.has(id)) {
        subscription.unsubscribe();
        sendResponse({ result: { type: 'stopped' } });
        throw new TRPCError({
          message: `Duplicate id ${id}`,
          code: 'BAD_REQUEST',
        });
      }

      listeners.push(() => subscription.unsubscribe());
      subscriptions.set(id, subscription);
      sendResponse({ result: { type: 'started' } });
    } catch (cause) {
      logger.error(cause);
      handleError(cause);
    }
  };

  panel.webview.onDidReceiveMessage(
    onMessage,
    undefined,
    context.subscriptions
  );

  panel.onDidDispose(() => {
    cleanup();
  });
}
