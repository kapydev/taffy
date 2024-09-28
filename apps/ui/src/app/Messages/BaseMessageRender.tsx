import { Alert, AlertTitle, AlertDescription } from '@taffy/components';
import { ReactNode } from 'react';
import { MessageIcon } from '../../llms/messages/tools';

export function BaseMessageRender({
  icon: Icon,
  title,
  description,
  children,
  onApprove,
  onDecline,
}: {
  icon: MessageIcon;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  onApprove?: () => void;
  onDecline?: () => void;
}) {
  return (
    <Alert>
      <Icon className="w-4 h-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {children}
      <div className="flex gap-2">
        {onDecline && (
          <button className="text-vsc-errorForeground" onClick={onDecline}>
            Decline
          </button>
        )}
        {onApprove && (
          <button className="text-vsc-foreground" onClick={onApprove}>
            Approve
          </button>
        )}
      </div>
    </Alert>
  );
}
