import { X } from 'lucide-react';

interface WebsiteEmbedProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export function WebsiteEmbed({ url, onClose, title }: WebsiteEmbedProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title || 'Website'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <iframe
          src={url}
          className="flex-1 w-full border-0"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}