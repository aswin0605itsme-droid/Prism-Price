import React from 'react';
import { Product } from '../types';
import GlassCard from './GlassCard';
import { ShoppingCart, ArrowRight, TrendingDown, Tag, ImageOff, Scale, Check, ExternalLink, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductResultProps {
  product: Product;
  isCheapest: boolean;
  onAddToCompare: (product: Product) => void;
}

const ProductResult: React.FC<ProductResultProps> = ({ product, isCheapest, onAddToCompare }) => {
  const [isCompareAdded, setIsCompareAdded] = React.useState(false);

  const handleCompare = () => {
    onAddToCompare(product);
    setIsCompareAdded(true);
    setTimeout(() => setIsCompareAdded(false), 2000);
  };

  return (
    <GlassCard 
      hoverEffect={true} 
      variant={isCheapest ? 'highlight' : 'default'}
      className={cn(
        "group flex flex-col h-full",
        isCheapest && "border-indigo-500/30 ring-1 ring-indigo-500/20"
      )}
    >
      {/* Badges */}
      {isCheapest && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-gradient-to-bl from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-lg">
            <TrendingDown className="w-3 h-3" />
            BEST DEAL
          </div>
        </div>
      )}

      {/* Product Image Area */}
      <div className="h-48 w-full relative overflow-hidden bg-white/5 rounded-t-xl group-hover:bg-white/10 transition-colors p-6 flex items-center justify-center">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-2xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <ImageOff className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">No Preview</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider text-slate-300 font-medium">
            <Tag className="w-3 h-3" />
            {product.retailer}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <Star className="w-3 h-3 fill-amber-400" />
              {product.rating}
            </div>
          )}
        </div>

        <h3 className="text-base font-semibold text-white leading-tight mb-4 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Price</p>
              <p className={cn(
                "text-2xl font-bold tracking-tight",
                isCheapest ? "text-indigo-400" : "text-white"
              )}>
                {product.currency}{product.price.toLocaleString()}
              </p>
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
              product.inStock 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}>
              {product.inStock ? 'In Stock' : 'Sold Out'}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                product.inStock
                  ? "bg-white text-slate-900 hover:bg-indigo-50"
                  : "bg-white/5 text-slate-500 cursor-not-allowed"
              )}
            >
              {product.inStock ? (
                <>
                  Visit Store <ExternalLink className="w-3 h-3" />
                </>
              ) : "Unavailable"}
            </a>
            
            <button
              onClick={handleCompare}
              disabled={isCompareAdded}
              className={cn(
                "px-3 rounded-xl border flex items-center justify-center transition-all",
                isCompareAdded
                  ? "bg-green-500/20 border-green-500/30 text-green-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300"
              )}
            >
              {isCompareAdded ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductResult;