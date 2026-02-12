
import React, { useState } from 'react';
import { Product } from '../types';
import GlassCard from './GlassCard';
import { ShoppingCart, ArrowRight, TrendingDown, Tag, ImageOff, Scale, Check, X, ZoomIn, AlertCircle, Eye } from 'lucide-react';

interface ProductResultProps {
  product: Product;
  isCheapest: boolean;
  onAddToCompare: (product: Product) => void;
}

const ProductResult: React.FC<ProductResultProps> = ({ product, isCheapest, onAddToCompare }) => {
  const [imageError, setImageError] = useState(false);
  const [isCompareAdded, setIsCompareAdded] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleCompare = () => {
    onAddToCompare(product);
    setIsCompareAdded(true);
    setTimeout(() => setIsCompareAdded(false), 2000);
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    setIsCartAdded(true);
    // Placeholder for actual cart logic
    console.log(`Added to cart: ${product.name} at ${product.retailer}`);
    setTimeout(() => setIsCartAdded(false), 2000);
  };

  return (
    <>
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
              <div className="absolute inset-0 bg-green-500/40 blur-xl rounded-full animate-pulse"></div>
              <div className="relative overflow-hidden bg-gradient-to-bl from-green-400 to-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-[0_4px_12px_rgba(16,185,129,0.4)] flex items-center gap-1.5 animate-in zoom-in-90 slide-in-from-top-4 fade-in duration-300 delay-100">
                  <TrendingDown className="w-3 h-3" />
                  Best Deal
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"></div>
              </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-5 relative z-10">
          {/* Image Container */}
          <button 
            onClick={() => product.image && !imageError && setIsPreviewOpen(true)}
            disabled={!product.image || imageError}
            className={`
              relative w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden 
              border border-white/10 transition-all duration-500
              ${product.image && !imageError ? 'bg-white cursor-zoom-in group-hover:border-indigo-500/30' : 'bg-white/5 cursor-not-allowed'}
            `}
            title={product.image && !imageError ? "View larger image" : "Image unavailable"}
          >
              {product.image && !imageError ? (
                  <>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-110" 
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900/50 backdrop-blur-sm p-1 text-center">
                     {imageError ? (
                       <>
                         <AlertCircle className="w-6 h-6 text-amber-500/70 mb-1" />
                         <span className="text-[9px] text-amber-500/60 font-medium leading-tight">Image<br/>Error</span>
                       </>
                     ) : (
                       <>
                         <ImageOff className="w-6 h-6 text-slate-600 mb-1" />
                         <span className="text-[9px] text-slate-600 font-medium leading-tight">No<br/>Preview</span>
                       </>
                     )}
                  </div>
              )}
          </button>

          {/* Text Content */}
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
        <div className="mt-auto flex flex-col gap-4 relative z-10 pt-4 border-t border-white/5">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className={`text-2xl font-bold tracking-tight ${isCheapest ? 'text-green-400' : 'text-white'}`}>
                {product.currency}{product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider mt-1 ${product.inStock ? 'text-green-500/80' : 'text-red-500/80'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQuickViewOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-indigo-300 transition-all duration-300 hover:scale-105 active:scale-95 group/view"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={handleCompare}
                disabled={isCompareAdded}
                className={`
                  p-2 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 group/compare
                  ${isCompareAdded 
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-indigo-300'
                  }
                `}
                title="Add to Compare"
              >
                {isCompareAdded ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isCartAdded || !product.inStock}
                className={`
                  p-2 rounded-xl border transition-all duration-300 
                  ${!product.inStock 
                    ? 'bg-white/5 border-white/5 text-slate-600 opacity-50 cursor-not-allowed' 
                    : isCartAdded 
                      ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:scale-105 active:scale-95' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-green-400 hover:scale-105 active:scale-95 group/cart'
                  }
                `}
                title={product.inStock ? "Add to Cart" : "Out of Stock"}
              >
                {isCartAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {product.inStock ? (
            <a 
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 group/btn
                ${isCheapest 
                  ? 'bg-green-500 text-white hover:bg-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)]' 
                  : 'bg-white/10 text-white hover:bg-indigo-600 shadow-lg shadow-black/20'}
              `}
            >
              {isCheapest ? 'Buy from ' + product.retailer : 'View on Store'}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button 
              disabled
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
            >
              Currently Unavailable
            </button>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </GlassCard>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setIsQuickViewOpen(false)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
             <GlassCard className="!p-0 overflow-hidden shadow-2xl border-white/20">
                <button 
                  onClick={() => setIsQuickViewOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/30 rounded-full text-slate-600 hover:text-white transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image Section */}
                  <div className="bg-white p-8 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                     {product.image && !imageError ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-contain max-h-[350px]"
                        />
                     ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                           <ImageOff className="w-16 h-16 mb-2 opacity-50" />
                           <span className="text-sm">Image Unavailable</span>
                        </div>
                     )}
                  </div>
                  
                  {/* Details Section */}
                  <div className="p-8 flex flex-col bg-slate-950/50">
                     <div className="mb-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-3">
                           <Tag className="w-4 h-4" />
                           {product.retailer}
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight mb-4">
                           {product.name}
                        </h2>
                        {isCheapest && (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/30">
                              <TrendingDown className="w-3 h-3" /> Best Deal
                           </div>
                        )}
                     </div>
                     
                     <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-slate-400 mb-1">Current Price</div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-bold text-white">
                              {product.currency}{product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                           </span>
                        </div>
                        <div className={`mt-2 text-sm font-medium ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                           {product.inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                        </div>
                     </div>

                     <div className="mt-auto space-y-3">
                        {product.inStock ? (
                           <a href={product.url} target="_blank" rel="noopener noreferrer" 
                              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all group/modal-btn">
                              View on {product.retailer}
                              <ArrowRight className="w-5 h-5 group-hover/modal-btn:translate-x-1 transition-transform" />
                           </a>
                        ) : (
                           <button disabled className="w-full py-4 rounded-xl bg-white/5 text-slate-500 font-medium cursor-not-allowed border border-white/10">
                              Unavailable
                           </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                           <button onClick={handleCompare} disabled={isCompareAdded} 
                              className={`py-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${isCompareAdded ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}`}>
                              {isCompareAdded ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                              {isCompareAdded ? 'Added' : 'Compare'}
                           </button>
                           <button onClick={handleAddToCart} disabled={isCartAdded || !product.inStock}
                               className={`py-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${!product.inStock ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/5' : isCartAdded ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}`}>
                               {isCartAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                               {isCartAdded ? 'Added' : 'Cart'}
                           </button>
                        </div>
                     </div>
                  </div>
                </div>
             </GlassCard>
          </div>
        </div>
      )}

      {/* Image Preview Modal (Keep existing logic if preferred, or rely on quick view. I will keep it for image click) */}
      {isPreviewOpen && product.image && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[210]"
            onClick={() => setIsPreviewOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-4xl w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/zoom bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-8 max-h-[80vh] w-auto">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out hover:scale-125 cursor-zoom-in"
                />
            </div>
            
            <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                <p className="text-white font-bold text-lg drop-shadow-md">{product.name}</p>
                <p className="text-slate-400 text-sm">{product.retailer}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductResult;
