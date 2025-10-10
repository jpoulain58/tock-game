import React from "react";
import { Card } from "@/store/gameStore";

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
              className={`border rounded px-3 py-2 shadow font-mono text-lg transition-all ${
                isSelected 
                  ? 'bg-yellow-400 dark:bg-yellow-600 border-yellow-600 scale-110 font-bold' 
                  : 'bg-white dark:bg-gray-700 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
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
