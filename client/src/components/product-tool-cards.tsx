import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";

interface Product {
  name: string;
  description: string;
  pricing: string;
  website: string;
}

interface ProductToolCardsProps {
  products: Product[];
}

export function ProductToolCards({ products }: ProductToolCardsProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();
  
  const handleTryProduct = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recommended Products</h3>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
        {products.map((product, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 min-w-[280px] h-[140px] flex-shrink-0 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">{product.name}</h4>
                <p className="text-white/70 text-xs mb-2 line-clamp-2">{product.description}</p>
              </div>
              {currentUser && (
                <Button
                  onClick={() => {
                    const productId = `product_tool_${index}_${product.name}`;
                    if (isFavorite(productId)) {
                      removeFromFavorites(productId);
                    } else {
                      addToFavorites({
                        id: productId,
                        type: 'product',
                        name: product.name,
                        description: product.description,
                        features: ['Quick Access', 'Easy to Use', 'Reliable'],
                        pricing: product.pricing,
                        website: product.website,
                        category: 'AI Tool'
                      }, showFavoritesNotification);
                    }
                  }}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-auto ml-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite(`product_tool_${index}_${product.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-white/80 text-xs font-medium">{product.pricing}</span>
              <Button
                onClick={() => handleTryProduct(product.website)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Try This
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}