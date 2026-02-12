
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ScanLine, ShoppingBag, Globe, ChevronDown, Scale, X } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenAnalysis: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  comparisonCount: number;
  onOpenCompare: () => void;
}

const SUGGESTIONS = [
  'iPhone 15 Pro Max',
  'iPhone 15 (128GB)',
  'Samsung S24 Ultra',
  'Samsung Galaxy M34',
  'Sony WH-1000XM5',
  'Sony PS5 Console',
  'MacBook Air M2',
  'MacBook Pro M3',
  'Apple Watch Series 9',
  'AirPods Pro 2',
  'Nike Air Max',
  'Adidas Ultraboost',
  'Atomic Habits Book',
  'OnePlus 12 5G',
  'iPad Air M2',
  'Nintendo Switch OLED'
];

const Navbar: React.FC<NavbarProps> = ({ onSearch, onOpenAnalysis, currency, setCurrency, comparisonCount, onOpenCompare }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim().length > 1) {
      const match = SUGGESTIONS.find(s => 
        s.toLowerCase().startsWith(inputValue.toLowerCase())
      );
      if (match && match.toLowerCase() !== inputValue.toLowerCase()) {
        const remaining = match.slice(inputValue.length);
        setSuggestion(inputValue + remaining);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      setSuggestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
      e.preventDefault();
      setInputValue(suggestion);
      setSuggestion('');
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestion('');
    inputRef.current?.focus();
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="hidden sm:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
              Prism
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-1 sm:mx-4 md:mx-8 min-w-0">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              
              {/* Suggestion Overlay */}
              {suggestion && (
                <div className="absolute inset-y-0 left-0 pl-9 sm:pl-10 pr-3 py-2 sm:py-3 pointer-events-none flex items-center z-10 w-full">
                  <span className="text-sm leading-5 text-transparent whitespace-pre">
                    {inputValue}
                  </span>
                  <span className="text-sm leading-5 text-slate-500/60 whitespace-pre">
                    {suggestion.slice(inputValue.length)}
                  </span>
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-9 sm:pl-10 pr-24 py-2 sm:py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-sm transition-all duration-300 backdrop-blur-sm relative z-20"
                placeholder="Search products..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2 z-30">
                {/* Clear Button */}
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Keyboard Hints */}
                <div className="hidden sm:flex items-center">
                  {suggestion ? (
                    <kbd className="inline-flex items-center border border-indigo-500/30 bg-indigo-500/10 rounded px-2 py-0.5 text-[10px] font-sans font-medium text-indigo-300">
                      Tab
                    </kbd>
                  ) : (
                    <kbd className="inline-flex items-center border border-white/10 rounded px-2 py-0.5 text-[10px] font-sans font-medium text-slate-400">
                      Enter
                    </kbd>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Compare Button */}
            {comparisonCount > 0 && (
                <button 
                  onClick={onOpenCompare}
                  className="relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 transition-all duration-300"
                >
                  <Scale className="w-4 h-4" />
                  <span className="text-sm font-medium hidden lg:inline">Compare</span>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center bg-indigo-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-lg">
                    {comparisonCount}
                  </span>
                </button>
            )}

            {/* Currency Dropdown */}
            <div className="relative group/currency">
              <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-slate-200 transition-all duration-300">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 group-hover/currency:text-slate-300" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-24 rounded-xl bg-slate-900 border border-white/10 shadow-xl overflow-hidden hidden group-hover/currency:block animate-in fade-in slide-in-from-top-2 duration-200">
                {['INR', 'USD', 'EUR', 'GBP', 'JPY'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${currency === c ? 'text-indigo-400 font-medium' : 'text-slate-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={onOpenAnalysis}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-slate-200 transition-all duration-300 group"
            >
              <ScanLine className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span className="hidden sm:inline">Scan</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
