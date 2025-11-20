'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HlsVideoPlayer } from '@/components/hls-video-player';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, videoName }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold truncate">{videoName}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Player */}
        <div className="aspect-video">
          <HlsVideoPlayer 
            src={videoUrl} 
            className="w-full h-full" 
          />
        </div>
      </div>
    </div>
  );
}
