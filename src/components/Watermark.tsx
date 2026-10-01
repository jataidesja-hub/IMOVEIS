import { MessageCircle } from 'lucide-react';

export default function Watermark() {
  const numero = "5574981165246";
  const texto = encodeURIComponent("Olá, gostaria de saber mais sobre o sistema de gestão de imóveis que vi no site.");
  
  return (
    <a 
      href={`https://wa.me/${numero}?text=${texto}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[9999] bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-slate-50 transition-transform hover:-translate-y-1 group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
         <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-500">
           <span>Desenvolvido por</span>
           <span className="font-bold text-slate-800">J.A Software</span>
         </div>
         <div className="hidden sm:block w-px h-3 bg-slate-300"></div>
         <div className="flex items-center gap-1 text-green-600 text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-0">
           <MessageCircle size={12} className="sm:w-3.5 sm:h-3.5" />
           (74) 98116-5246
         </div>
      </div>
    </a>
  );
}
