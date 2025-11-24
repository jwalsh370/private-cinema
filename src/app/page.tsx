// app/page.tsx
'use client';
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { MetadataManager } from '@/components/MetadataManager';
import { Upload, Database, Settings } from 'lucide-react';

type View = 'upload' | 'manage' | 'settings';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('upload')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 ${
                currentView === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={20} />
              <span>Upload</span>
            </button>
            
            <button
              onClick={() => setCurrentView('manage')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 ${
                currentView === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database size={20} />
              <span>Manage Metadata</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'upload' && <FileUpload />}
        {currentView === 'manage' && <MetadataManager />}
      </main>
    </div>
  );
}
