import React from 'react';

interface DebugPanelProps {
  messages: string[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ messages }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <ul className="list-disc pl-4">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default DebugPanel;