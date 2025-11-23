// src/app/page.tsx
import { FileUpload } from '@/components/FileUpload';
import { MediaGallery } from '@/components/MediaGallery';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        <FileUpload />
        <MediaGallery />
      </div>
    </main>
  );
}
