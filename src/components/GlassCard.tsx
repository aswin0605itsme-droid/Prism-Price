import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: 'default' | 'dark' | 'highlight';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hoverEffect = false, 
  variant = 'default',
  ...props 
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out",
        // Base Glass Styles
        "backdrop-blur-xl shadow-xl",
        
        // Variants
        variant === 'default' && "bg-white/5 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        variant === 'dark' && "bg-black/40 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        variant === 'highlight' && "bg-indigo-500/10 border-indigo-500/20 shadow-[0_8px_32px_rgba(99,102,241,0.15)]",

        // Hover Effects
        hoverEffect && "hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/20 hover:bg-white/10",
        
        className
      )}
      {...props}
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      {/* Dynamic Gradients */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/0 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-blue-500/0 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;