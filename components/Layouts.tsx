import React from 'react';
import { SlideContent } from '../types';

interface LayoutProps {
  slide: SlideContent;
}

// Helper for consistent image styling
// Removed high contrast/sepia filters to allow AI generated "Photorealistic" quality to shine
const Image: React.FC<{ src: string; className?: string }> = ({ src, className = "" }) => (
  <div className={`relative overflow-hidden bg-stone-200 ${className}`}>
    <img
      src={src}
      alt="Presentation Visual"
      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
    />
  </div>
);

export const TypeA: React.FC<LayoutProps> = ({ slide }) => {
  return (
    <div className="w-full h-full grid grid-cols-12 gap-6 p-8 bg-stone-100 overflow-hidden">
      {/* Left: Main Content (Col 8) */}
      <div className="col-span-8 h-full flex flex-col overflow-hidden">
        {/* Header - Fixed Height Content */}
        <div className="mb-6 shrink-0">
           {slide.chapter && <p className="text-bronze-dark text-xs font-sans tracking-widest uppercase mb-2">{slide.chapter}</p>}
           <h1 className="text-4xl font-cn font-bold text-stone-900 mb-2 line-clamp-1">{slide.title}</h1>
           <h2 className="text-xl font-serif italic text-stone-600 line-clamp-1">{slide.subTitle}</h2>
        </div>
        
        {/* Main Image - Flexible Height (Constraint) */}
        <div className="flex-1 min-h-0 w-full relative rounded-sm overflow-hidden mb-6">
             <Image src={slide.images[0]} className="w-full h-full" />
        </div>

        {/* Footer Text - Fixed/Shrinkable Content */}
        <p className="text-stone-700 font-sans font-light text-sm max-w-lg leading-relaxed shrink-0 line-clamp-3">
          {slide.body}
        </p>
      </div>

      {/* Right: Details (Col 4) */}
      <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
        {/* Using flex-1 relative pattern to force exact 50/50 split within available height */}
        <div className="flex-1 w-full relative rounded-sm overflow-hidden">
            <Image src={slide.images[1]} className="w-full h-full" />
        </div>
        <div className="flex-1 w-full relative rounded-sm overflow-hidden">
            <Image src={slide.images[2]} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export const TypeB: React.FC<LayoutProps> = ({ slide }) => {
    const count = slide.images.length;
    const isSplit = count === 2;
    const isGrid4 = count === 4;
    const isGrid3 = count === 3;

  return (
    <div className="w-full h-full flex flex-col p-8 bg-stone-100 overflow-hidden">
       {/* Header */}
       <div className="mb-6 text-center shrink-0">
           {slide.chapter && <p className="text-bronze-dark text-xs font-sans tracking-widest uppercase mb-2">{slide.chapter}</p>}
           <h1 className="text-3xl font-cn font-bold text-stone-900">{slide.title}</h1>
           <h2 className="text-lg font-serif italic text-stone-600">{slide.subTitle}</h2>
           {slide.body && <p className="mt-2 text-stone-500 text-sm font-sans font-light max-w-2xl mx-auto line-clamp-2">{slide.body}</p>}
        </div>

      {/* Grid Container - Fills remaining height strictly */}
      <div className="flex-1 min-h-0 w-full relative">
        
        {/* 2 Images Split */}
        {isSplit && (
            <div className="w-full h-full flex gap-1">
                <div className="flex-1 relative">
                    <Image src={slide.images[0]} className="w-full h-full" />
                </div>
                <div className="flex-1 relative">
                    <Image src={slide.images[1]} className="w-full h-full" />
                </div>
            </div>
        )}

        {/* 4 Images Grid */}
        {isGrid4 && (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
                {slide.images.map((img, i) => (
                    <div key={i} className="relative w-full h-full">
                        <Image src={img} className="w-full h-full" />
                    </div>
                ))}
            </div>
        )}

        {/* 3 Images Grid (1 Big Left, 2 Small Right) - Common layout for odd numbers */}
        {isGrid3 && (
            <div className="w-full h-full grid grid-cols-12 gap-4">
                <div className="col-span-8 relative rounded-sm overflow-hidden">
                     <Image src={slide.images[0]} className="w-full h-full" />
                </div>
                <div className="col-span-4 flex flex-col gap-4 h-full">
                     <div className="flex-1 relative rounded-sm overflow-hidden">
                        <Image src={slide.images[1]} className="w-full h-full" />
                     </div>
                     <div className="flex-1 relative rounded-sm overflow-hidden">
                        <Image src={slide.images[2]} className="w-full h-full" />
                     </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export const TypeC: React.FC<LayoutProps> = ({ slide }) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-stone-900 group">
       {/* Image container matching the parent size */}
       <div className="absolute inset-0 w-full h-full">
            <Image src={slide.images[0]} className="w-full h-full" />
       </div>
       
       {/* Overlays */}
       <div className="absolute inset-0 bg-stone-900/30 mix-blend-multiply pointer-events-none" />
       <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent pointer-events-none" />
       
       <div className="absolute bottom-16 left-12 max-w-3xl z-10 pointer-events-none">
            {slide.chapter && <p className="text-stone-300 text-xs font-sans tracking-[0.3em] uppercase mb-4 border-b border-stone-500/30 inline-block pb-1">{slide.chapter}</p>}
            <h1 className="text-6xl font-cn font-bold text-stone-100 mb-3 tracking-wide leading-tight drop-shadow-lg">{slide.title}</h1>
            <h2 className="text-2xl font-serif italic text-stone-300 drop-shadow-md">{slide.subTitle}</h2>
       </div>
    </div>
  );
};

export const TypeD: React.FC<LayoutProps> = ({ slide }) => {
  return (
    <div className="w-full h-full flex bg-stone-50 overflow-hidden">
        {/* Image Area (60%) - Strictly relative container */}
        <div className="w-[60%] h-full relative">
            <Image src={slide.images[0]} className="w-full h-full" />
        </div>
        
        {/* Text Area (40%) */}
        <div className="w-[40%] h-full flex flex-col justify-center px-12 py-16 bg-[#f5f2eb] overflow-hidden relative z-10">
            {slide.chapter && <div className="mb-8 w-12 h-[1px] bg-bronze-dark shrink-0"></div>}
            <h1 className="text-4xl font-cn font-bold text-stone-800 mb-4 shrink-0 leading-tight">{slide.title}</h1>
            <h2 className="text-xl font-serif italic text-bronze-dark mb-12 shrink-0">{slide.subTitle}</h2>
            
            <div className="overflow-y-auto pr-4 custom-scrollbar">
                <p className="text-stone-800 font-cn text-lg leading-relaxed mb-6">
                    {slide.body}
                </p>
                {slide.enBody && (
                     <p className="text-stone-500 font-sans font-light text-sm leading-relaxed border-t border-stone-300 pt-6">
                     {slide.enBody}
                 </p>
                )}
            </div>
        </div>
    </div>
  );
};