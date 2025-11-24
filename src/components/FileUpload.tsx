// src/components/FileUpload.tsx (simplified version)
'use client';
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'movies');
      formData.append('type', 'video');

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadedFiles(prev => [...prev, {
            filename: file.name,
            status: 'success',
            parsedMetadata: result.parsedMetadata
          }]);
        }
      } catch (error) {
        setUploadedFiles(prev => [...prev, {
          filename: file.name,
          status: 'error',
          error: 'Upload failed'
        }]);
      }
    }
    
    setUploading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Upload Files</h2>
        <p className="text-gray-600 mb-6">
          Upload your video files first. You can add metadata later in the management dashboard.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Select Videos'}
        </button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Uploaded Files:</h3>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {file.status === 'success' ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
                <span className="font-mono text-sm">{file.filename}</span>
              </div>
              <span className={`text-sm ${
                file.status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {file.status === 'success' ? 'Uploaded' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.some(f => f.status === 'success') && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            ✅ Files uploaded successfully! 
            <br />
            Go to the <strong>Metadata Manager</strong> to add TMDB metadata.
          </p>
        </div>
      )}
    </div>
  );
}
