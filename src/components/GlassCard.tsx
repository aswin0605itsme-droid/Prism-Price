import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
        rounded-2xl
        p-6
        transition-all duration-500 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)]' : ''}
        ${className}
      `}
    >
      {/* Decorative gradient blob inside card */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;