// src/app/page.tsx
import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Private Video Upload</h1>
      <FileUpload />
    </main>
  );
}
