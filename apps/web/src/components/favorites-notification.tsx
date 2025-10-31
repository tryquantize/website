import { useEffect } from 'react';
import { Heart, X } from 'lucide-react';

interface FavoritesNotificationProps {
  show: boolean;
  itemName: string;
  onClose: () => void;
}

export function FavoritesNotification({ show, itemName, onClose }: FavoritesNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 transform transition-all duration-300 ease-out animate-fade-in">
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-2xl max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Added to favorites</p>
            <p className="text-xs text-white/70 truncate">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );
}