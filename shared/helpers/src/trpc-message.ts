import {
  TRPCVscMessage,
  TRPCVscResponse,
  TRPCVscRequest,
} from '@taffy/shared-types';

type WithTRPCId<T> = T & { trpc: { id: string } };

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
function isNullOrUndefined(x: unknown): x is null | undefined {
  return x === null || x === undefined;
}
export function isTRPCMessage(message: unknown): message is TRPCVscMessage {
  return Boolean(
    isPlainObject(message) && 'trpc' in message && isPlainObject(message['trpc'])
  );
}

function isTRPCMessageWithId(
  message: unknown
): message is WithTRPCId<TRPCVscMessage> {
  return (
    isTRPCMessage(message) &&
    'id' in message.trpc &&
    !isNullOrUndefined(message.trpc.id)
  );
}

// reponse needs error or result
export function isTRPCResponse(
  message: unknown
): message is TRPCVscResponse {
  return (
    isTRPCMessageWithId(message) &&
    ('error' in message.trpc || 'result' in message.trpc)
  );
}

// request needs method
export function isTRPCRequest(message: unknown): message is TRPCVscRequest {
  return isTRPCMessageWithId(message) && 'method' in message.trpc;
}

export function isTRPCRequestWithId(
  message: unknown
): message is WithTRPCId<TRPCVscRequest> {
  return isTRPCRequest(message) && isTRPCMessageWithId(message);
}
