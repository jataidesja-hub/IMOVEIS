'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  fotos: string[];
  titulo: string;
}

export default function ImageGallery({ fotos, titulo }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeFotos = fotos || [];

  if (safeFotos.length === 0) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <div className="h-72 sm:h-96 flex items-center justify-center bg-gray-100">
          <Building2 className="w-20 h-20 text-gray-300" />
        </div>
      </div>
    );
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % safeFotos.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + safeFotos.length) % safeFotos.length);
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <div 
          className="relative h-72 sm:h-96 cursor-pointer group bg-black" 
          onClick={() => setIsModalOpen(true)}
        >
          <Image 
            src={safeFotos[currentIndex]} 
            alt={titulo} 
            fill 
            className="object-contain sm:object-cover" 
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
          </div>
          
          {safeFotos.length > 1 && (
            <>
              <button 
                onClick={prevImage} 
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm transition text-slate-800"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage} 
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm transition text-slate-800"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        
        {safeFotos.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 p-1">
            {safeFotos.map((foto, i) => (
              <div 
                key={i} 
                className={`relative h-20 sm:h-24 cursor-pointer border-2 transition-colors ${i === currentIndex ? 'border-green-500' : 'border-transparent hover:border-gray-300'}`}
                onClick={() => setCurrentIndex(i)}
              >
                <Image src={foto} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <button 
            onClick={() => setIsModalOpen(false)} 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
          >
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-6xl h-[85vh]">
            <Image 
              src={safeFotos[currentIndex]} 
              alt={titulo} 
              fill 
              className="object-contain" 
              quality={100}
            />
          </div>

          {safeFotos.length > 1 && (
            <>
              <button 
                onClick={prevImage} 
                className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
              >
                <ChevronLeft size={48} />
              </button>
              <button 
                onClick={nextImage} 
                className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
              >
                <ChevronRight size={48} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full">
                {currentIndex + 1} / {safeFotos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
