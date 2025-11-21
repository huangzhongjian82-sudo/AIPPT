import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SLIDES } from './constants';
import { TypeA, TypeB, TypeC, TypeD } from './components/Layouts';
import { ChevronLeft, ChevronRight, Copy, Eye, Info, X, Sparkles, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPrompts, setShowPrompts] = useState(false);
  const [imageCache, setImageCache] = useState<Record<number, string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const currentSlide = SLIDES[currentSlideIndex];
  
  // Use generated images if available, otherwise fallback to placeholders
  const displayImages = imageCache[currentSlide.id] || currentSlide.images;
  
  // Create a slide object with the correct images to pass to Layouts
  const slideToRender = { ...currentSlide, images: displayImages };

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  }, [handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const generateImages = async () => {
    if (!process.env.API_KEY) {
        alert("API Key is missing. Cannot generate images.");
        return;
    }

    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const targetCount = currentSlide.images.length;
        const promptCount = currentSlide.prompts.length;
        
        // Global Style Tokens defined in specification 0.3
        const globalStyle = " -- Style: Modern Organic, Soft Minimalism, High-End Architectural Visualization, Photorealistic, 8k resolution. Lighting: Soft diffused daylight or warm golden hour, emphasis on shadows and volumetric lighting. Material Palette: Beige Travertine (rough & honed), Aged Bronze, Walnut Wood, Cream Boucle, Sheer Silk.";

        // Determine Aspect Ratio based on Layout
        let aspectRatio = '4:3';
        if (currentSlide.layout === 'C') aspectRatio = '16:9';
        if (currentSlide.layout === 'B') aspectRatio = '1:1'; // Grid looks best with squares
        if (currentSlide.layout === 'D') aspectRatio = '3:4'; // Vertical editorial

        let newImages: string[] = [];

        // Strategy 1: Single prompt for multiple image slots (e.g. variations for mood board)
        if (promptCount === 1 && targetCount > 1) {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: currentSlide.prompts[0] + globalStyle,
                config: {
                    numberOfImages: targetCount,
                    aspectRatio: aspectRatio,
                }
            });
            if (response.generatedImages) {
                newImages = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
            }
        } 
        // Strategy 2: Multiple prompts (one per slot or matched)
        else {
            // Generate all needed images in parallel
            const promises = Array.from({ length: targetCount }).map(async (_, index) => {
                // Use the corresponding prompt, or recycle the last one if we run out (safety fallback)
                const promptText = currentSlide.prompts[index] || currentSlide.prompts[0];
                
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: promptText + globalStyle,
                    config: {
                        numberOfImages: 1,
                        aspectRatio: aspectRatio,
                    }
                });
                return response.generatedImages?.[0]?.image.imageBytes 
                    ? `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`
                    : null;
            });

            const results = await Promise.all(promises);
            newImages = results.filter((img): img is string => !!img);
        }

        if (newImages.length > 0) {
            setImageCache(prev => ({
                ...prev,
                [currentSlide.id]: newImages
            }));
        }
    } catch (error) {
        console.error("Image generation failed:", error);
        alert("Failed to generate images. Check console for details.");
    } finally {
        setIsGenerating(false);
    }
  };

  const renderLayout = () => {
    switch (currentSlide.layout) {
      case 'A': return <TypeA slide={slideToRender} />;
      case 'B': return <TypeB slide={slideToRender} />;
      case 'C': return <TypeC slide={slideToRender} />;
      case 'D': return <TypeD slide={slideToRender} />;
      default: return <TypeA slide={slideToRender} />;
    }
  };

  const copyPrompt = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen w-full bg-stone-900 flex flex-col items-center justify-center p-4 font-sans text-stone-800 relative">
      
      {/* Header Info */}
      <div className="absolute top-4 left-6 text-stone-500 text-xs tracking-widest flex gap-4 items-center z-50">
         <span className="font-bold text-stone-300">FLUID SERENITY</span>
         <span>|</span>
         <span>{currentSlideIndex + 1} / {SLIDES.length}</span>
         {isGenerating && <span className="flex items-center gap-2 text-bronze"><Loader2 className="animate-spin" size={12}/> AI Generating...</span>}
      </div>

      {/* Main Slide Container - 16:10 Aspect Ratio */}
      <div className="relative w-full max-w-7xl aspect-[16/10] bg-white shadow-2xl overflow-hidden transition-all duration-500 group">
        {renderLayout()}
        
        {/* Generation Loading Overlay */}
        {isGenerating && (
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-bronze-light" />
                <p className="font-serif text-xl italic tracking-wide">Materializing Vision...</p>
            </div>
        )}

        {/* Prompt Overlay */}
        {showPrompts && (
            <div className="absolute inset-0 bg-stone-900/95 z-40 p-12 flex flex-col justify-center items-center text-stone-200 overflow-y-auto backdrop-blur-sm transition-opacity duration-300">
                <div className="max-w-3xl w-full">
                    <div className="flex justify-between items-center mb-8 border-b border-stone-700 pb-4">
                        <h3 className="text-2xl font-serif italic text-bronze">Nanobanana Prompts</h3>
                        <button onClick={() => setShowPrompts(false)} className="hover:text-white"><X size={24}/></button>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 bg-stone-800 rounded-md border border-stone-700">
                            <p className="text-xs text-bronze uppercase tracking-widest mb-2">Global Style Tokens</p>
                            <p className="text-sm text-stone-400 italic">Style: Modern Organic, Soft Minimalism, High-End Architectural Visualization, Photorealistic, 8k resolution. Lighting: Soft diffused daylight or warm golden hour, emphasis on shadows and volumetric lighting. Material Palette: Beige Travertine (rough & honed), Aged Bronze, Walnut Wood, Cream Boucle, Sheer Silk.</p>
                        </div>
                        {currentSlide.prompts.map((prompt, idx) => (
                            <div key={idx} className="group/prompt relative bg-stone-800 p-6 rounded-md border border-stone-700 hover:border-bronze transition-colors">
                                <div className="absolute top-4 right-4 opacity-0 group-hover/prompt:opacity-100 transition-opacity">
                                    <button onClick={() => copyPrompt(prompt)} className="p-2 hover:bg-stone-700 rounded-full" title="Copy Prompt">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <p className="font-mono text-sm leading-relaxed text-stone-300">{prompt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-6 items-center z-50">
        <button 
          onClick={handlePrev} 
          disabled={currentSlideIndex === 0}
          className="p-3 rounded-full bg-stone-800 text-stone-200 hover:bg-bronze disabled:opacity-30 disabled:hover:bg-stone-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-2 bg-stone-800 p-1.5 rounded-full">
            <button 
            onClick={() => setShowPrompts(!showPrompts)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-colors ${showPrompts ? 'bg-bronze text-stone-900' : 'text-stone-300 hover:bg-stone-700'}`}
            >
            {showPrompts ? <Eye size={16} /> : <Info size={16} />}
            {showPrompts ? 'Hide' : 'Prompts'}
            </button>

            <button 
            onClick={generateImages}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                imageCache[currentSlide.id] 
                ? 'text-bronze hover:bg-stone-700 hover:text-white' 
                : 'bg-stone-200 text-stone-900 hover:bg-white'
            }`}
            >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {imageCache[currentSlide.id] ? 'Regenerate' : 'Visualize (AI)'}
            </button>
        </div>

        <button 
          onClick={handleNext}
          disabled={currentSlideIndex === SLIDES.length - 1}
          className="p-3 rounded-full bg-stone-800 text-stone-200 hover:bg-bronze disabled:opacity-30 disabled:hover:bg-stone-800 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
};

export default App;