
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PriceCard from './components/PriceCard';
import ProductResult from './components/ProductResult';
import ProductSkeleton from './components/ProductSkeleton';
import ChatWidget from './components/ChatWidget';
import ImageAnalysisModal from './components/ImageAnalysisModal';
import ComparisonSidebar from './components/ComparisonSidebar';
import { Subscription, Product } from './types';
import { searchProductsWithGrounding, isApiConfigured } from './services/geminiService';
import { Sparkles, ArrowUp, ArrowDown, History, TrendingUp, AlertTriangle } from 'lucide-react';
import GlassCard from './components/GlassCard';

const App: React.FC = () => {
  // Debug Log
  useEffect(() => {
    console.log("App Component Mounted");
    // Check API Key existence as requested
    if (!process.env.API_KEY) { 
        console.error('API Key is missing from Environment Variables'); 
    }
  }, []);

  // API Config State
  const [isConfigured, setIsConfigured] = useState(true);

  // Check API Configuration on mount
  useEffect(() => {
    setIsConfigured(isApiConfigured());
  }, []);

  // Currency State
  const [currency, setCurrency] = useState('INR');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'asc' | 'desc'>('default');
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('prism_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('prism_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Exchange Rates (Base: INR)
  const exchangeRates: Record<string, number> = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.8
  };

  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  };

  const convertAmount = (amount: number) => amount * exchangeRates[currency];
  const formatCurrency = (amount: number) => {
    return `${currencySymbols[currency]}${amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}`;
  };

  const recommendedProducts: Product[] = [
    { id: 'rec-1', name: 'iPhone 15 (128GB)', retailer: 'Amazon.in', price: 65999, currency: '₹', url: 'https://www.amazon.in', inStock: true, image: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SX679_.jpg' },
    { id: 'rec-2', name: 'Sony WH-1000XM5', retailer: 'Reliance Digital', price: 29990, currency: '₹', url: 'https://www.reliancedigital.in', inStock: true, image: 'https://m.media-amazon.com/images/I/51aXvjzcukL._SX679_.jpg' },
    { id: 'rec-3', name: 'MacBook Air M2', retailer: 'Flipkart', price: 89900, currency: '₹', url: 'https://www.flipkart.com', inStock: true, image: 'https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg' },
    { id: 'rec-4', name: 'Samsung S24 Ultra', retailer: 'Croma', price: 129999, currency: '₹', url: 'https://www.croma.com', inStock: true, image: 'https://m.media-amazon.com/images/I/71RVuS3q9QL._SX679_.jpg' },
  ];

  const socialSubsRaw: Subscription[] = [
    { id: '1', name: 'X Premium', priceMonthly: '650', priceYearly: '6800', features: ['Edit posts', 'Blue checkmark'], url: 'https://twitter.com', iconName: 'Twitter', color: 'bg-slate-500' },
    { id: '2', name: 'YouTube Premium', priceMonthly: '129', priceYearly: '1290', features: ['Ad-free', 'Background play'], url: 'https://www.youtube.com', iconName: 'Youtube', color: 'bg-red-500' },
    { id: '3', name: 'LinkedIn Premium', priceMonthly: '1500', priceYearly: '12000', features: ['InMail', 'Insights'], url: 'https://www.linkedin.com', iconName: 'Linkedin', color: 'bg-blue-600' },
    { id: '4', name: 'Meta Verified', priceMonthly: '699', priceYearly: '8388', features: ['Badge', 'Protection'], url: 'https://about.meta.com', iconName: 'Facebook', color: 'bg-blue-400' }
  ];

  const socialSubs = socialSubsRaw.map(sub => ({
    ...sub,
    priceMonthly: formatCurrency(convertAmount(parseInt(sub.priceMonthly))),
    priceYearly: formatCurrency(convertAmount(parseInt(sub.priceYearly))),
  }));

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    if (!isConfigured) {
      alert("Please configure your API Key to search.");
      return;
    }

    setIsSearching(true);
    setProducts([]);
    setSortOption('default');

    // Update History
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 6);
    });

    if (query.toLowerCase().trim() === 'book') {
      setTimeout(() => {
        setProducts([
          { id: '1', name: 'Atomic Habits', retailer: 'Amazon.in', price: 551, currency: '₹', url: 'https://www.amazon.in', inStock: true, image: 'https://picsum.photos/200' },
          { id: '2', name: 'Atomic Habits', retailer: 'Flipkart', price: 499, currency: '₹', url: 'https://www.flipkart.com', inStock: true, image: 'https://picsum.photos/201' },
        ]);
        setIsSearching(false);
      }, 800);
    } else {
      const results = await searchProductsWithGrounding(query);
      setProducts(results);
      setIsSearching(false);
    }
  };

  const getSortedProducts = () => {
    if (sortOption === 'default') return products;
    return [...products].sort((a, b) => {
      if (sortOption === 'asc') return a.price - b.price;
      return b.price - a.price;
    });
  };

  const addToCompare = (product: Product) => {
    setComparisonList(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    if (comparisonList.length === 0) setIsCompareOpen(true);
  };

  const displayProducts = getSortedProducts().map(p => ({
    ...p,
    price: convertAmount(p.price),
    currency: currencySymbols[currency]
  }));
  
  const cheapestId = displayProducts.length > 0 
    ? displayProducts.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)).id 
    : null;

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <Navbar 
        onSearch={handleSearch} 
        onOpenAnalysis={() => setShowAnalysisModal(true)} 
        currency={currency}
        setCurrency={setCurrency}
        comparisonCount={comparisonList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        searchHistory={searchHistory}
      />
      
      {!isConfigured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <GlassCard className="border-amber-500/30 bg-amber-500/10 !p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/20 text-amber-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">API Key Missing</h3>
                        <p className="text-sm text-slate-300">Please configure your Google Gemini API Key in the environment variables to enable AI features.</p>
                    </div>
                </div>
            </GlassCard>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Subscriptions */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
             <h2 className="text-3xl font-bold text-white tracking-tight">Subscription Monitor</h2>
             <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialSubs.map(sub => (
              <PriceCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>

        {/* Product Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
               <h2 className="text-3xl font-bold text-white tracking-tight">Product Analysis</h2>
            </div>
            {products.length > 0 && (
              <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                <button 
                  onClick={() => setSortOption('asc')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortOption === 'asc' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <ArrowUp className="w-3 h-3 inline mr-1" /> Low to High
                </button>
                <button 
                  onClick={() => setSortOption('desc')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortOption === 'desc' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <ArrowDown className="w-3 h-3 inline mr-1" /> High to Low
                </button>
              </div>
            )}
          </div>

          <div className="min-h-[300px]">
            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <ProductSkeleton key={n} />
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {displayProducts.map(product => (
                  <ProductResult 
                    key={product.id} 
                    product={product} 
                    isCheapest={product.id === cheapestId}
                    onAddToCompare={addToCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {/* Search History Tags */}
                {searchHistory.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History className="w-4 h-4" /> Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {searchHistory.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(h)}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 hover:border-indigo-500/50 transition-all flex items-center gap-2 group"
                        >
                          <History className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Recommended For You
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedProducts.map(product => (
                      <ProductResult 
                        key={product.id} 
                        product={{
                          ...product,
                          price: convertAmount(product.price),
                          currency: currencySymbols[currency]
                        }} 
                        isCheapest={false}
                        onAddToCompare={addToCompare}
                      />
                    ))}
                  </div>
                </div>

                {/* Empty State Instructions */}
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 relative">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Prism Smart Search</h3>
                  <p className="text-slate-400 max-w-sm px-4">
                    Type a product name above to compare prices across India's top retailers instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget />
      <ComparisonSidebar 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        items={comparisonList}
        onRemove={(id) => setComparisonList(prev => prev.filter(p => p.id !== id))}
        onClear={() => { setComparisonList([]); setIsCompareOpen(false); }}
      />
      <ImageAnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} />
    </div>
  );
};

export default App;
