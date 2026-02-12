import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ScanLine, ShoppingBag, Globe, ChevronDown, Scale, X, History, Loader2, Clock } from 'lucide-react';
import { getSearchSuggestions } from '../services/geminiService';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenAnalysis: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  comparisonCount: number;
  onOpenCompare: () => void;
  searchHistory: string[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenAnalysis, 
  currency, 
  setCurrency, 
  comparisonCount, 
  onOpenCompare,
  searchHistory 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Debounce logic for suggestions
  useEffect(() => {
    const trimmedInput = inputValue.trim();
    
    // Reset states if input is empty
    if (trimmedInput.length === 0) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      if (document.activeElement === inputRef.current && searchHistory.length > 0) {
        setShowHistory(true);
      }
      return;
    }

    setShowHistory(false);
    setIsLoadingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const suggestions = await getSearchSuggestions(trimmedInput);
        if (suggestions.length > 0) {
          setFilteredSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions");
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, searchHistory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setIsLoadingHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const handleSuggestionClick = (selected: string) => {
    setInputValue(selected);
    setShowSuggestions(false);
    onSearch(selected);
  };

  const handleHistoryClick = (item: string) => {
    setInputValue(item);
    setShowHistory(false);
    onSearch(item);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
    inputRef.current?.focus();
  };

  // Helper to highlight matching text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight) return text;
    try {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className="text-indigo-400 font-bold">{part}</span>
        ) : (
          <span key={index} className="text-slate-300">{part}</span>
        )
      );
    } catch (e) {
      return text;
    }
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
            <form ref={formRef} onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>

              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-9 sm:pl-10 pr-24 py-2 sm:py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-sm transition-all duration-300 backdrop-blur-sm relative z-20"
                placeholder="Search products..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => {
                  if (inputValue.trim().length === 0 && searchHistory.length > 0) {
                    setShowHistory(true);
                    setIsLoadingHistory(true);
                    setTimeout(() => setIsLoadingHistory(false), 800);
                  } else if (filteredSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />

              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2 z-30">
                {/* Loading Indicator */}
                {isLoadingSuggestions && (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                )}

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

                {/* Keyboard Hint */}
                <div className="hidden sm:flex items-center">
                    <kbd className="inline-flex items-center border border-white/10 rounded px-2 py-0.5 text-[10px] font-sans font-medium text-slate-400">
                      Enter
                    </kbd>
                </div>
              </div>

              {/* Dynamic Suggestions & History Dropdown */}
              {(showSuggestions && filteredSuggestions.length > 0) || (showHistory && searchHistory.length > 0) ? (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {showSuggestions ? (
                    <ul className="max-h-72 overflow-y-auto custom-scrollbar">
                      {filteredSuggestions.map((item, index) => (
                        <li 
                          key={index}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 group/item"
                        >
                          <Search className="w-4 h-4 text-slate-500 group-hover/item:text-indigo-400 transition-colors flex-shrink-0" />
                          <span className="text-sm truncate flex-1">
                            {renderHighlightedText(item, inputValue)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4">
                      {isLoadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
                           <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                           <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">Syncing History...</span>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> Recent Searches
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {searchHistory.slice(0, 5).map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(term)}
                                    className="
                                      group/tag relative pl-3 pr-4 py-2 rounded-full 
                                      bg-slate-800/40 border border-white/5 
                                      hover:bg-indigo-500/10 hover:border-indigo-500/30 
                                      text-slate-400 hover:text-indigo-300 
                                      text-xs font-medium transition-all duration-300 
                                      flex items-center gap-2
                                      hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]
                                    "
                                >
                                    <History className="w-3 h-3 opacity-50 group-hover/tag:opacity-100 transition-opacity" />
                                    <span className="truncate max-w-[180px]">{term}</span>
                                </button>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
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