import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { GenerateQR } from './components/GenerateQR';
import { DecodeQR } from './components/DecodeQR';

const AppContent: React.FC = () => {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState('generate');

  const tabs = [
    {
      id: 'generate',
      label: t.tabs.generate,
      content: <GenerateQR />,
    },
    {
      id: 'decode',
      label: t.tabs.decode,
      content: <DecodeQR />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            VietQR Research Tool © {new Date().getFullYear()} - For educational purposes only
          </p>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            Built with React, TypeScript, Vite & TailwindCSS
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
