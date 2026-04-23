import React, { useState } from 'react';

export default function FlashcardItem({ item }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
        className="relative w-full h-64 cursor-pointer group perspective-1000" 
        onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Mặt Trước */}
        <div className="absolute w-full h-full backface-hidden bg-white/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize text-center">
                {item.TuVung}
            </h3>
            {item.LoaiTu && (
                <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full">
                    {item.LoaiTu}
                </span>
            )}
            {item.PhienAm && (
                <p className="mt-3 text-slate-500 font-mono text-sm tracking-widest">
                    /{item.PhienAm}/
                </p>
            )}
            <div className="absolute bottom-4 mx-auto text-xs text-slate-400 font-medium">Nhấn để lật thẻ</div>
        </div>

        {/* Mặt Sau */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-900/40 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl shadow-sm p-6 flex flex-col justify-center overflow-y-auto">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Ý nghĩa</h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                {item.Nghia}
            </p>
            
            {item.ViDuNguCanh && (
                <div className="mt-auto">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Ví Dụ</h4>
                    <p className="text-slate-600 dark:text-slate-400 italic text-sm border-l-2 border-indigo-300 pl-3">
                        "{item.ViDuNguCanh}"
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
