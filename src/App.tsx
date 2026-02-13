import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PriceCard from './components/PriceCard';
import ProductResult from './components/ProductResult';
import ChatWidget from './components/ChatWidget';
import ImageAnalysisModal from './components/ImageAnalysisModal';
import ComparisonSidebar from './components/ComparisonSidebar';
import { Product, Subscription } from './types';
import { searchProductsWithGrounding, isApiConfigured } from './services/geminiService';
import { Sparkles, ArrowRight, Activity, Zap } from 'lucide-react';
import GlassCard from './components/GlassCard';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setProducts([]); // Clear previous
    const results = await searchProductsWithGrounding(query);
    setProducts(results);
    setIsSearching(false);
  };

  const addToCompare = (product: Product) => {
    setComparisonList(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    setIsCompareOpen(true);
  };

  // Dummy subscriptions for the dashboard
  const subscriptions: Subscription[] = [
    { id: '1', name: 'Netflix Premium', priceMonthly: '649', priceYearly: '7788', features: ['4K HDR', 'Spatial Audio'], url: '#', iconName: 'Monitor', color: 'text-red-500' },
    { id: '2', name: 'Spotify Duo', priceMonthly: '149', priceYearly: '1788', features: ['Ad-free', 'Offline'], url: '#', iconName: 'Music', color: 'text-green-500' },
    { id: '3', name: 'Google One', priceMonthly: '130', priceYearly: '1300', features: ['100GB', 'AI Features'], url: '#', iconName: 'Cloud', color: 'text-blue-500' },
    { id: '4', name: 'Amazon Prime', priceMonthly: '299', priceYearly: '1499', features: ['Fast Delivery', 'Video'], url: '#', iconName: 'Package', color: 'text-cyan-500' },
  ];

  const cheapestId = products.length > 0 
    ? products.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)).id 
    : null;

  return (
    <div className="min-h-screen font-sans text-slate-100 selection:bg-indigo-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617]">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <Navbar 
        onSearch={handleSearch} 
        onOpenAnalysis={() => setShowAnalysis(true)}
        currency={currency}
        setCurrency={setCurrency}
        comparisonCount={comparisonList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-28 space-y-20">
        
        {/* Hero / Dashboard Section */}
        {!products.length && !isSearching && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-6 py-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Next-Gen Price Tracking
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                Buying decisions, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Simplified.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-400">
                Compare prices across major Indian retailers in real-time. Powered by Gemini AI for unmatched accuracy and depth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptions.map(sub => (
                <PriceCard key={sub.id} sub={sub} />
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {(products.length > 0 || isSearching) && (
          <div className="space-y-8 min-h-[60vh]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-400" />
                Live Analysis
              </h2>
              {isSearching && <span className="text-sm text-indigo-300 animate-pulse">Scanning retailers...</span>}
            </div>

            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[...Array(4)].map((_, i) => (
                   <GlassCard key={i} className="h-[400px] animate-pulse">
                     <div className="h-48 bg-white/5" />
                     <div className="p-6 space-y-4">
                       <div className="h-6 bg-white/10 rounded w-3/4" />
                       <div className="h-4 bg-white/5 rounded w-1/2" />
                     </div>
                   </GlassCard>
                 ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductResult 
                    key={product.id} 
                    product={product} 
                    isCheapest={product.id === cheapestId}
                    onAddToCompare={addToCompare}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <ChatWidget />
      <ComparisonSidebar 
        isOpen={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)}
        items={comparisonList}
        onRemove={(id) => setComparisonList(l => l.filter(i => i.id !== id))}
        onClear={() => setComparisonList([])}
      />
      <ImageAnalysisModal isOpen={showAnalysis} onClose={() => setShowAnalysis(false)} />
    </div>
  );
};

export default App;