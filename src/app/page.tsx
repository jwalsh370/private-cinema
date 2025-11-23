// src/app/page.tsx
import { FileUpload } from '@/components/FileUpload';
import { MediaGallery } from '@/components/MediaGallery';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Private Video Library</h1>
      <FileUpload />
      <MediaGallery />
    </main>
  );
}
