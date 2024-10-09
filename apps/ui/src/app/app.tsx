import { Toaster } from 'react-hot-toast';
import { useErrorCatching } from './ErrorBoundary';
import { MainChat } from './MainChat';
import { KeyboardShortcuts } from './KeyboardShortcuts/KeyboardShortcuts';
import { TooltipProvider } from '@taffy/components';

export default function App() {
  useErrorCatching();

  return (
    <div className="h-full w-full py-3.5">
      <TooltipProvider delayDuration={200}>
        <MainChat />
      </TooltipProvider>
      <KeyboardShortcuts />
      <Toaster
        toastOptions={{
          style: {
            background: 'var(--vscode-notifications-background)',
            color: 'var(--vscode-notifications-foreground)',
          },
        }}
      />
    </div>
  );
}
