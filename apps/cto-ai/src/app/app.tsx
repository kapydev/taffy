import { Toaster } from 'react-hot-toast';
import { useErrorCatching } from './ErrorBoundary';
import { MainChat } from './MainChat';

export default function App() {
  useErrorCatching();

  return (
    <div className="h-full w-full">
      <MainChat />
      <Toaster />
    </div>
  );
}
