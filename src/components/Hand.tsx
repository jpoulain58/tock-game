import React from "react";
import type { Card } from "@/types";

type Props = {
  hand: Card[];
  onSelect?: (card: Card) => void;
  selectedCard?: Card | null;
};

export default function Hand({ hand, onSelect, selectedCard }: Props) {
  return (
    <div className="flex gap-2 mt-4">
      {hand.map(card => {
        const isSelected = selectedCard?.id === card.id;
        const isSeven = card.rank === '7';
        
        return (
          <div key={card.id} className="relative group">
            <button
              className={`border-2 rounded-lg px-3 py-2 shadow-md font-mono text-lg transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-yellow-300 dark:bg-yellow-600 border-yellow-600 dark:border-yellow-500 scale-110 font-bold text-gray-900 dark:text-white ring-4 ring-yellow-200 dark:ring-yellow-900' 
                  : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-lg'
              }`}
              onClick={() => onSelect?.(card)}
            >
              {card.rank}
              <span className="ml-1">{card.suit}</span>
            </button>
            
            {isSeven && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <div className="flex items-center gap-1">
                  <span>💡</span>
                  <span>Le 7 capture tous les pions sur son passage !</span>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
