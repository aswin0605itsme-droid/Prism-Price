import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PriceCard from './components/PriceCard';
import ProductResult from './components/ProductResult';
import ChatWidget from './components/ChatWidget';
import ImageAnalysisModal from './components/ImageAnalysisModal';
import ComparisonSidebar from './components/ComparisonSidebar';
import { Subscription, Product } from './types';
import { searchProductsWithGrounding } from './services/geminiService';
import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

const App: React.FC = () => {
  // Currency State
  const [currency, setCurrency] = useState('INR');

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

  // Helper to convert raw numbers
  const convertAmount = (amount: number) => {
    return amount * exchangeRates[currency];
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return `${currencySymbols[currency]}${amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}`;
  };

  // Hardcoded Data (Updated for Indian Pricing)
  const socialSubsRaw: Subscription[] = [
    {
      id: '1',
      name: 'X Premium',
      priceMonthly: '650', // Storing as string number for simpler parsing logic below
      priceYearly: '6800',
      features: ['Edit posts', 'Longer posts', 'Undo tweet', 'Blue checkmark'],
      url: 'https://twitter.com/i/premium_sign_up',
      iconName: 'Twitter',
      color: 'bg-slate-500'
    },
    {
      id: '2',
      name: 'YouTube Premium',
      priceMonthly: '129',
      priceYearly: '1290',
      features: ['Ad-free videos', 'Background play', 'YouTube Music', 'Downloads'],
      url: 'https://www.youtube.com/premium',
      iconName: 'Youtube',
      color: 'bg-red-500'
    },
    {
      id: '3',
      name: 'LinkedIn Premium',
      priceMonthly: '1500', 
      priceYearly: '12000',
      features: ['InMail credits', 'Who viewed profile', 'LinkedIn Learning', 'Applicant insights'],
      url: 'https://www.linkedin.com/premium',
      iconName: 'Linkedin',
      color: 'bg-blue-600'
    },
     {
      id: '4',
      name: 'Meta Verified',
      priceMonthly: '699',
      priceYearly: '8388',
      features: ['Verified Badge', 'Account Protection', 'Support Access', 'Stickers'],
      url: 'https://about.meta.com/technologies/meta-verified/',
      iconName: 'Facebook',
      color: 'bg-blue-400'
    }
  ];

  // Convert Subs based on selected currency
  const socialSubs = socialSubsRaw.map(sub => ({
    ...sub,
    priceMonthly: formatCurrency(convertAmount(parseInt(sub.priceMonthly))),
    priceYearly: formatCurrency(convertAmount(parseInt(sub.priceYearly))),
  }));

  // Mock Book Data (Updated for Indian Context)
  const mockBooks: Product[] = [
    { id: '1', name: 'Atomic Habits', retailer: 'Amazon.in', price: 551, currency: '₹', url: 'https://www.amazon.in/Atomic-Habits-James-Clear/dp/1847941834', inStock: true, image: 'https://picsum.photos/200' },
    { id: '2', name: 'Atomic Habits', retailer: 'Flipkart', price: 499, currency: '₹', url: 'https://www.flipkart.com/atomic-habits/p/itm', inStock: true, image: 'https://picsum.photos/201' },
    { id: '3', name: 'Atomic Habits', retailer: 'Crossword', price: 650, currency: '₹', url: 'https://www.crossword.in', inStock: false, image: 'https://picsum.photos/202' },
    { id: '4', name: 'Atomic Habits', retailer: 'Bookswagon', price: 520, currency: '₹', url: 'https://www.bookswagon.com', inStock: true, image: 'https://picsum.photos/203' },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'asc' | 'desc'>('default');
  
  // State for comparison list
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setProducts([]);
    setSortOption('default'); // Reset sort on new search

    // Logic: If query is 'Book', show mock data as a demo. Else, use Gemini Grounding.
    if (query.toLowerCase().trim() === 'book') {
      setTimeout(() => {
        setProducts(mockBooks);
        setIsSearching(false);
      }, 800); // Fake loading delay
    } else {
      // Use Gemini for real grounding and structured data
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
      // Avoid duplicates
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    // Auto-open sidebar on first add
    if (comparisonList.length === 0) {
      setIsCompareOpen(true);
    }
  };

  const removeFromCompare = (productId: string) => {
    setComparisonList(prev => prev.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
    setIsCompareOpen(false);
  };

  // Convert Products for display
  const displayProducts = getSortedProducts().map(p => ({
    ...p,
    price: convertAmount(p.price),
    currency: currencySymbols[currency]
  }));
  
  const getCheapestProductId = () => {
    if (displayProducts.length === 0) return null;
    return displayProducts.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)).id;
  };

  const cheapestId = getCheapestProductId();

  return (
    <div className="min-h-screen pb-20 relative">
      <Navbar 
        onSearch={handleSearch} 
        onOpenAnalysis={() => setShowAnalysisModal(true)} 
        currency={currency}
        setCurrency={setCurrency}
        comparisonCount={comparisonList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section 1: Subscription Comparison */}
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

        {/* Section 2: Product Search Results */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
               <h2 className="text-3xl font-bold text-white tracking-tight">Product Analysis</h2>
            </div>
            
            {/* Sort Controls (Only visible when products exist) */}
            {products.length > 0 && (
              <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-xs text-slate-400 px-3 font-medium uppercase tracking-wider hidden sm:inline">Sort Price:</span>
                <button 
                  onClick={() => setSortOption('asc')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortOption === 'asc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ArrowUp className="w-3 h-3" /> Low to High
                </button>
                <button 
                  onClick={() => setSortOption('desc')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortOption === 'desc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ArrowDown className="w-3 h-3" /> High to Low
                </button>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mb-8"></div>

          <div className="min-h-[300px]">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-400 animate-pulse">Scanning Indian retailers for best deals...</p>
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
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to Compare</h3>
                <p className="text-slate-400 max-w-md">
                  Search for "Book" for a demo, or search any real product (e.g. "iPhone 15", "Nike Shoes") to see live prices and images.
                </p>
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
        onRemove={removeFromCompare}
        onClear={clearComparison}
      />

      <ImageAnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} />
    </div>
  );
};

export default App;