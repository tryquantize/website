import { X, ExternalLink } from 'lucide-react';

interface InlineWebsiteEmbedProps {
  url: string;
  onClose: () => void;
  title?: string;
  height?: string;
}

export function InlineWebsiteEmbed({ 
  url, 
  onClose, 
  title, 
  height = "500px" 
}: InlineWebsiteEmbedProps) {
  return (
    <div className="border border-white/20 rounded-lg bg-black/80 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">{title || 'Website'}</span>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink size={18} />
          </a>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <iframe
        src={url}
        style={{ height }}
        className="w-full border-0"
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}