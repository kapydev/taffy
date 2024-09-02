import { CustomMessage } from "../../llms/messages/Messages";

export function AssistantMessageRender({ message }: { message: CustomMessage; }) {
  return <div className="whitespace-pre">{message.contents}</div>;
}
