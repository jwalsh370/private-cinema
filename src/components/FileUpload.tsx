// src/components/FileUpload.tsx
'use client';

import { useState } from 'react';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      // Step 1: Get presigned URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');
      
      // Step 2: Upload to S3
      const { url } = await res.json();
      const s3Response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!s3Response.ok) throw new Error('Upload to S3 failed');

      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          disabled={uploading}
        />
        <span className="text-lg font-medium">
          {uploading ? 'Uploading...' : 'Select Video File'}
        </span>
        <span className="text-sm text-gray-500">MP4, MOV, AVI files</span>
      </label>
      
      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg">
          Error: {error}
        </div>
      )}
    </div>
  );
}
