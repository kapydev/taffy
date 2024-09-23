import { AnyTRPCRouter } from '@trpc/server';
import type { NodeHTTPCreateContextOption } from '@trpc/server/adapters/node-http';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';
import * as vscode from 'vscode';
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
  TOptions & { panel: vscode.WebviewPanel; context: vscode.ExtensionContext };

export function createVscExtHandler<TRouter extends AnyTRPCRouter>(
  opts: CreateHandlerOptions<TRouter, { req: undefined; res: undefined }, {}>
) {
  const { panel, context } = opts;
  console.log("ext handler made :)")
  panel.webview.onDidReceiveMessage(
    (message) => {
      console.log('In the vsc ext handler!', message);
    },
    undefined,
    context.subscriptions
  );
}
