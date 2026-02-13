import React from 'react';
import { Product } from '../types';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ComparisonSidebar: React.FC<Props> = ({ isOpen, onClose, items, onRemove, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#0a0f1e] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">Compare Products</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">
              No items to compare yet.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4">
                <div className="w-16 h-16 bg-white rounded-lg p-1 flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-contain" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-white truncate">{item.name}</h4>
                  <p className="text-xs text-slate-400 mb-2">{item.retailer}</p>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-indigo-400">{item.currency}{item.price.toLocaleString()}</span>
                    <button onClick={() => onRemove(item.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-white/5">
             <button onClick={onClear} className="w-full py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
               Clear All
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonSidebar;