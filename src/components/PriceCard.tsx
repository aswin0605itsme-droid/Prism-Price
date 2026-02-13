import React from 'react';
import { Subscription } from '../types';
import GlassCard from './GlassCard';
import { Check, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

const PriceCard: React.FC<{ sub: Subscription }> = ({ sub }) => {
  return (
    <GlassCard hoverEffect={true} className="flex flex-col p-6 h-full">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-xl bg-white/5", sub.color)}>
           {/* Placeholder icons based on name would go here, kept simple for now */}
           <div className="w-6 h-6 rounded-full bg-current opacity-50" />
        </div>
        <a href={sub.url} className="p-2 text-slate-400 hover:text-white transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-1">{sub.name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-2xl font-bold">₹{sub.priceMonthly}</span>
        <span className="text-sm text-slate-500">/mo</span>
      </div>

      <div className="space-y-3 mt-auto">
        {sub.features.map((feat, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {feat}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default PriceCard;