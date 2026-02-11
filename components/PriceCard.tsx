import React from 'react';
import { ExternalLink, Check, Youtube, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Subscription } from '../types';
import GlassCard from './GlassCard';

interface PriceCardProps {
  sub: Subscription;
}

const PriceCard: React.FC<PriceCardProps> = ({ sub }) => {
  const getIcon = () => {
    switch (sub.iconName) {
      case 'Twitter': return <Twitter className="w-6 h-6" />;
      case 'Youtube': return <Youtube className="w-6 h-6" />;
      case 'Linkedin': return <Linkedin className="w-6 h-6" />;
      case 'Facebook': return <Facebook className="w-6 h-6" />;
      default: return <ExternalLink className="w-6 h-6" />;
    }
  };

  return (
    <GlassCard hoverEffect={true} className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${sub.color} bg-opacity-20 text-white`}>
          {getIcon()}
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/5">
          {sub.name}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{sub.priceMonthly}</span>
          <span className="text-sm text-slate-400">/mo</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          or {sub.priceYearly} billed yearly
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {sub.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-indigo-400" />
            </div>
            <span className="text-sm text-slate-300 leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      <a
        href={sub.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-center transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
      >
        Visit Site
        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </GlassCard>
  );
};

export default PriceCard;