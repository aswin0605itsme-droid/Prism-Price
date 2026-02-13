import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Globe, ChevronDown, Scale, X, Loader2, ScanLine } from 'lucide-react';
import { getSearchSuggestions } from '../services/geminiService';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenAnalysis: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  comparisonCount: number;
  onOpenCompare: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenAnalysis, 
  currency, 
  setCurrency, 
  comparisonCount, 
  onOpenCompare 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.length > 2) {
        setLoading(true);
        const results = await getSearchSuggestions(inputValue);
        setSuggestions(results);
        setLoading(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
              Prism
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl relative z-50">
            <form ref={formRef} onSubmit={handleSubmit} className="relative group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all shadow-inner"
                  placeholder="Compare prices for anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                  {inputValue && !loading && (
                    <button type="button" onClick={() => setInputValue('')} className="p-1 hover:bg-white/10 rounded-full text-slate-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#0a0f1e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3 group/item"
                      onClick={() => {
                        setInputValue(suggestion);
                        onSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      <Search className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-indigo-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {comparisonCount > 0 && (
              <button 
                onClick={onOpenCompare}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-medium text-sm"
              >
                <Scale className="w-4 h-4" />
                <span>Compare</span>
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {comparisonCount}
                </span>
              </button>
            )}

            <button 
              onClick={onOpenAnalysis}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-medium text-sm group"
            >
              <ScanLine className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">Scan Image</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-xl p-1 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      currency === c ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;