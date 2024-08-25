import React, { useState } from 'react';
import { Checkbox } from '@cto-ai/components';
import { ScrollArea } from '@cto-ai/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cto-ai/components';
import { Button } from '@cto-ai/components';
import { Input } from '@cto-ai/components';
import { ChevronRight, ChevronDown, Send } from 'lucide-react';
import '../stores/file-store';

// Mock data for file tree
const fileTree = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Button.tsx', type: 'file' },
          { name: 'Input.tsx', type: 'file' },
        ],
      },
      { name: 'App.tsx', type: 'file' },
      { name: 'index.tsx', type: 'file' },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    children: [
      { name: 'index.html', type: 'file' },
      { name: 'favicon.ico', type: 'file' },
    ],
  },
  { name: 'package.json', type: 'file' },
  { name: 'README.md', type: 'file' },
];

// Mock data for chat messages
const initialMessages = [
  { role: 'human', content: 'Hello, can you help me with React?' },
  {
    role: 'ai',
    content:
      "Of course! I'd be happy to help you with React. What specific question or topic would you like assistance with?",
  },
  { role: 'human', content: 'How do I create a functional component?' },
  {
    role: 'ai',
    content:
      "Creating a functional component in React is straightforward. Here's a basic example:\n\n```jsx\nimport React from 'react';\n\nconst MyComponent = () => {\n  return (\n    <div>\n      <h1>Hello, I'm a functional component!</h1>\n    </div>\n  );\n};\n\nexport default MyComponent;\n```\n\nThis creates a simple component that renders a heading. You can then use this component in other parts of your application like this:\n\n```jsx\nimport MyComponent from './MyComponent';\n\nfunction App() {\n  return (\n    <div>\n      <MyComponent />\n    </div>\n  );\n}\n```\n\nLet me know if you need any clarification or have more questions!",
  },
];

export default function Component() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const toggleFile = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((f) => f !== path) : [...prev, path]
    );
  };

  const renderFileTree = (items: any[], path = '') => {
    return items.map((item, index) => {
      const currentPath = `${path}/${item.name}`;
      if (item.type === 'folder') {
        return (
          <div key={currentPath}>
            <div className="flex items-center">
              {item.children ? <ChevronRight className="h-4 w-4" /> : null}
              <span>{item.name}</span>
            </div>
            <div className="ml-4">
              {renderFileTree(item.children || [], currentPath)}
            </div>
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

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { role: 'human', content: input }]);
      setInput('');
      // Here you would typically send the message to your chatbot/LLM
      // and then add its response to the messages
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Repository Files</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {renderFileTree(fileTree)}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="main" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="main">Main Chat</TabsTrigger>
            <TabsTrigger value="raw">Raw Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="main" className="flex-1 flex flex-col p-4">
            <ScrollArea className="flex-1">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'ai' ? 'text-blue-600' : 'text-green-600'
                  }`}
                >
                  <strong>{message.role === 'ai' ? 'AI: ' : 'You: '}</strong>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\n/g, '<br>')
                        .replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>'),
                    }}
                  />
                </div>
              ))}
            </ScrollArea>
            <div className="flex mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 mr-2"
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="raw" className="flex-1 overflow-auto p-4">
            <pre>{JSON.stringify(messages, null, 2)}</pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
