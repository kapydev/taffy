import { Toaster } from 'react-hot-toast';
import { useErrorCatching } from './ErrorBoundary';
import { MainChat } from './MainChat';
import { KeyboardShortCuts } from './KeyboardShortCuts';

export default function App() {
  useErrorCatching();

  return (
    <div className="h-full w-full">
      <MainChat />
      <KeyboardShortCuts />
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
