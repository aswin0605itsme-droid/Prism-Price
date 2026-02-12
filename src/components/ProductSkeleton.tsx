import React from 'react';
import GlassCard from './GlassCard';

const ProductSkeleton: React.FC = () => {
  return (
    <GlassCard className="flex flex-col h-full relative overflow-hidden">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        {/* Image Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* Text Content Placeholders */}
        <div className="pt-1 min-w-0 flex-1 space-y-3">
          <div className="h-6 bg-white/10 rounded-lg w-3/4 animate-pulse relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          <div className="h-4 bg-white/5 rounded-lg w-1/2 animate-pulse"></div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto flex flex-col gap-4 relative z-10 pt-4 border-t border-white/5">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
            <div className="h-3 bg-white/5 rounded-lg w-16 animate-pulse"></div>
          </div>
          
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 animate-pulse"></div>
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 animate-pulse"></div>
          </div>
        </div>

        <div className="w-full h-10 rounded-xl bg-white/5 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductSkeleton;