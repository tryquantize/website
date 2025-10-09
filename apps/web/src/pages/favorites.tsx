import { useState } from 'react';
import { useFavorites } from '@/contexts/favorites-context';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { CompanyCards } from '@/components/company-cards';
import { ProductCards } from '@/components/product-cards';
import { FreelancerCards } from '@/components/freelancer-cards';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart } from 'lucide-react';
import { useLocation } from 'wouter';
import { NotificationProvider } from '@/contexts/notification-context';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const [, setLocation] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredFavorites = favorites.filter(item => selectedFilter === 'all' || item.type === selectedFilter);
  const companies = filteredFavorites.filter(item => item.type === 'company');
  const products = filteredFavorites.filter(item => item.type === 'product');
  const freelancers = filteredFavorites.filter(item => item.type === 'freelancer');

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view favorites</h1>
          <Button onClick={() => setLocation('/auth')}>Login</Button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-white">My Favorites</h1>
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter favorites" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Favorites</SelectItem>
              <SelectItem value="company" className="text-white hover:bg-white/10">Companies Only</SelectItem>
              <SelectItem value="product" className="text-white hover:bg-white/10">Products Only</SelectItem>
              <SelectItem value="freelancer" className="text-white hover:bg-white/10">Freelancers Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl text-white/60 mb-2">No favorites yet</h2>
            <p className="text-white/40">Start adding items to your favorites by clicking the heart icon on cards</p>
          </div>
        ) : (
          <NotificationProvider>
            <div className="space-y-8">
              {(selectedFilter === 'all' || selectedFilter === 'company') && companies.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Companies</h2>
                  <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
                    {companies.map((company, index) => (
                      <div key={company.id || index} className="flex-shrink-0">
                        <CompanyCards companies={[company]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(selectedFilter === 'all' || selectedFilter === 'product') && products.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Products</h2>
                  <ProductCards products={products} />
                </div>
              )}
              {(selectedFilter === 'all' || selectedFilter === 'freelancer') && freelancers.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Freelancers</h2>
                  <FreelancerCards freelancers={freelancers} />
                </div>
              )}
            </div>
          </NotificationProvider>
        )}
      </div>
    </div>
  );
}