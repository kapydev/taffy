import {
  Checkbox,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cto-ai/components';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { chatStore } from '../stores/chat-store';
import { fileStore } from '../stores/file-store';
import { MainChat } from './MainChat';

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const rootFolder = fileStore.use('rootFolder');
  const messages = chatStore.use('messages');

  const toggleFile = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((f) => f !== path) : [...prev, path]
    );
  };

  const renderFileTree = (folder: GeneratedFolder, path = '') => {
    return folder.subFolders.map((item) => {
      const currentPath = `${path}/${item.name}`;
      if (item.subFolders.length > 0 || item.files.length > 0) {
        return (
          <div key={currentPath}>
            <div className="flex items-center">
              {item.subFolders.length > 0 ? (
                <ChevronRight className="h-4 w-4" />
              ) : null}
              <span>{item.name}</span>
            </div>
            <div className="ml-4">{renderFileTree(item, currentPath)}</div>
          </div>
        );
      } else {
        return (
          <div key={currentPath} className="flex items-center space-x-2">
            <Checkbox
              id={currentPath}
              checked={selectedFiles.includes(currentPath)}
              onCheckedChange={() => toggleFile(currentPath)}
            />
            <label htmlFor={currentPath}>{item.name}</label>
          </div>
        );
      }
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Repository Files</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {rootFolder && renderFileTree(rootFolder)}
        </ScrollArea>
      </div>
      <MainChat />
    </div>
  );
}
