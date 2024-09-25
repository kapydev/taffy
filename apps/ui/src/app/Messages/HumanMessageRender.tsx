import { HumanMessage } from '../../llms/messages/HumanMessage';

export function HumanMessageRender({ message }: { message: HumanMessage }) {
  return <div>{message.contents}</div>;
}
