import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";

interface Product {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
}

interface ProductCardsProps {
  products: Product[];
}

export function ProductCards({ products }: ProductCardsProps) {
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
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
        {products.map((product, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 min-w-[320px] h-[480px] flex-shrink-0">
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-white text-base font-medium">{product.name}</h5>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                </div>
                {currentUser && (
                  <Button
                    onClick={() => {
                      const productId = `product_${index}_${product.name}`;
                      if (isFavorite(productId)) {
                        removeFromFavorites(productId);
                      } else {
                        addToFavorites({
                          id: productId,
                          type: 'product',
                          name: product.name,
                          description: product.description,
                          features: product.features,
                          pricing: product.pricing,
                          website: product.website,
                          category: product.category
                        }, showFavoritesNotification);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(`product_${index}_${product.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                  </Button>
                )}
              </div>
              
              <p className="text-white/70 text-sm mb-3">{product.description}</p>
              
              <div className="mb-3">
                <p className="text-xs text-white/60 mb-1">About Product</p>
                <div className="text-xs text-white/70 leading-relaxed">
                  <div>Professional-grade solution designed for modern workflows.</div>
                  <div>Trusted by industry leaders with proven track record.</div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-white/60 mb-1">Location</p>
                <div className="text-xs text-white/70">San Francisco, USA</div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-white/80 font-medium mb-2">Key Specifications</p>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">• Cloud-based architecture with 99.9% uptime</div>
                  <div className="text-xs text-white/70">• Advanced AI-powered automation features</div>
                  <div className="text-xs text-white/70">• Real-time collaboration and sync</div>
                  <div className="text-xs text-white/70">• Enterprise-grade security and compliance</div>
                  <div className="text-xs text-white/70">• Seamless integration with popular tools</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/80 font-medium">Rating</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm text-white/80">4.5 (700)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Category</span>
                  <span className="text-xs text-white/80">{product.category}</span>
                </div>
                <div className="text-sm text-white/80 font-medium">{product.pricing}</div>
              </div>
              
              <div className="flex space-x-1 mt-auto">
                <Button
                  onClick={() => handleTryProduct(product.website)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Try This Product!
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}