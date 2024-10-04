import { Toaster } from 'react-hot-toast';
import { useErrorCatching } from './ErrorBoundary';
import { MainChat } from './MainChat';
import { KeyboardShortcuts } from './KeyboardShortcuts/KeyboardShortcuts';

export default function App() {
  useErrorCatching();

  return (
    <div className="h-full w-full">
      <MainChat />
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
