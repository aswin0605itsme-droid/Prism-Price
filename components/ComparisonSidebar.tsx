import React from 'react';
import { X, Trash2, ExternalLink, ArrowRight, Scale, TrendingDown, ImageOff } from 'lucide-react';
import { Product } from '../types';
import GlassCard from './GlassCard';

interface ComparisonSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ComparisonSidebar: React.FC<ComparisonSidebarProps> = ({ isOpen, onClose, items, onRemove, onClear }) => {
  if (!isOpen) return null;

  // Find cheapest item in the comparison list to highlight
  const cheapestId = items.length > 0 
    ? items.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)).id 
    : null;

  return (
    <>
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={onClose}
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-[70] transform transition-transform duration-500 ease-out animate-in slide-in-from-right flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Compare</h2>
                        <p className="text-sm text-slate-400">{items.length} items selected</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
                        <Scale className="w-16 h-16 opacity-20" />
                        <p className="text-lg font-medium">Your comparison list is empty.</p>
                        <p className="text-sm max-w-[200px]">Add products from the search results to compare them here.</p>
                        <button 
                            onClick={onClose}
                            className="mt-4 px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    items.map((item) => {
                        const isBestDeal = item.id === cheapestId;
                        return (
                            <div 
                                key={item.id} 
                                className={`
                                    relative p-4 rounded-2xl border transition-all duration-300 group
                                    ${isBestDeal 
                                        ? 'bg-green-500/10 border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.1)]' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                                `}
                            >
                                {isBestDeal && (
                                    <div className="absolute -top-3 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3" /> Best Price
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-xl bg-white p-2 flex-shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageOff className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-white truncate pr-4" title={item.name}>
                                                {item.name}
                                            </h3>
                                            <button 
                                                onClick={() => onRemove(item.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="text-sm text-slate-400 mb-2">{item.retailer}</div>
                                        
                                        <div className="flex items-end justify-between">
                                            <div className={`text-lg font-bold ${isBestDeal ? 'text-green-400' : 'text-white'}`}>
                                                {item.currency}{item.price.toLocaleString()}
                                            </div>
                                            <a 
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500 hover:text-white text-slate-400 transition-all"
                                                title="Visit Retailer"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-white/5 space-y-3">
                    <button 
                        onClick={onClear}
                        className="w-full py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                    >
                        Clear List
                    </button>
                </div>
            )}
        </div>
    </>
  );
};

export default ComparisonSidebar;