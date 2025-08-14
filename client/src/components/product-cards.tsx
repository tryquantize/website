import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package } from "lucide-react";

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
  const handleTryProduct = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
        {products.map((product, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 min-w-[168px] h-[320px] flex-shrink-0">
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="text-white text-base font-medium">{product.name}</h5>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{product.category}</span>
                </div>
              </div>
              
              <p className="text-white/70 text-sm">{product.description}</p>
              
              <div>
                <p className="text-xs text-white/60 mb-1">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, featureIndex) => (
                    <span key={featureIndex} className="text-xs bg-white/5 text-white/80 border border-white/20 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-white/80 font-medium">{product.pricing}</div>
              
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