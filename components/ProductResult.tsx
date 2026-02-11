import React, { useState } from 'react';
import { Product } from '../types';
import GlassCard from './GlassCard';
import { ShoppingCart, ArrowRight, TrendingDown, Tag, ImageOff, Scale, Check } from 'lucide-react';

interface ProductResultProps {
  product: Product;
  isCheapest: boolean;
  onAddToCompare: (product: Product) => void;
}

const ProductResult: React.FC<ProductResultProps> = ({ product, isCheapest, onAddToCompare }) => {
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleCompare = () => {
    onAddToCompare(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <GlassCard 
      hoverEffect={true} 
      className={`
        group flex flex-col relative overflow-hidden
        ${isCheapest ? 'border-green-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]' : 'border-white/10'}
      `}
    >
      {/* Animated Best Value Badge */}
      {isCheapest && (
        <div className="absolute top-0 right-0 z-20">
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-green-500/40 blur-xl rounded-full animate-pulse"></div>
            
            {/* Badge */}
            <div className="relative overflow-hidden bg-gradient-to-bl from-green-400 to-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-[0_4px_12px_rgba(16,185,129,0.4)] flex items-center gap-1.5 animate-in zoom-in-90 slide-in-from-top-4 fade-in duration-300 delay-100">
                <TrendingDown className="w-3 h-3" />
                Best Deal
                {/* Shimmer Overlay */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"></div>
            </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-indigo-500/30 transition-colors duration-500 bg-white">
            {product.image && !imageError ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-110" 
                  onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 bg-slate-900 w-full h-full">
                   <ImageOff className="w-8 h-8 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
            )}
        </div>
        <div className="pt-1 min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white leading-tight mb-1.5 group-hover:text-indigo-300 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{product.retailer}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto flex items-end justify-between relative z-10 pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className={`text-2xl font-bold tracking-tight ${isCheapest ? 'text-green-400' : 'text-white'}`}>
            {product.currency}{product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] font-medium uppercase tracking-wider mt-1 ${product.inStock ? 'text-green-500/80' : 'text-red-500/80'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <div className="flex items-center gap-3 pl-2">
          <button
            onClick={handleCompare}
            disabled={isAdded}
            className={`
              p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 group/compare
              ${isAdded 
                ? 'bg-green-500/20 border-green-500/50 text-green-400 cursor-default' 
                : 'bg-white/5 hover:bg-indigo-500/20 border-white/10 text-slate-400 hover:text-indigo-300'
              }
            `}
            title="Add to Compare"
          >
            {isAdded ? <Check className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
          </button>

          <a 
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              pl-4 pr-3 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all duration-300
              ${isCheapest 
                ? 'bg-green-500 text-white hover:bg-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.5)]' 
                : 'bg-white/10 text-white hover:bg-indigo-600 hover:shadow-[0_4px_20px_rgba(79,70,229,0.3)]'}
            `}
          >
            {isCheapest ? 'Buy Now' : 'View'}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
      
      {/* Hover Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </GlassCard>
  );
};

export default ProductResult;