import { X, ExternalLink } from 'lucide-react';

interface EmbeddedWebsite {
  id: string;
  url: string;
  title: string;
}

interface MultiWebsiteEmbedProps {
  websites: EmbeddedWebsite[];
  onClose: (id: string) => void;
  height?: string;
}

export function MultiWebsiteEmbed({ 
  websites, 
  onClose, 
  height = "600px" 
}: MultiWebsiteEmbedProps) {
  if (websites.length === 0) return null;

  return (
    <div className="border border-white/20 rounded-lg bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        {websites.map((website) => (
          <div key={website.id} className="flex-shrink-0 w-96 border-r border-white/20 last:border-r-0">
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/60">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white text-sm truncate max-w-48">{website.title}</span>
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <button 
                onClick={() => onClose(website.id)} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              src={website.url}
              style={{ height }}
              className="w-full border-0"
              title={website.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ))}
      </div>
    </div>
  );
}