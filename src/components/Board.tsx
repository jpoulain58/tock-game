'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/hooks/gameStore';
import { useThemeStore } from '@/hooks/themeStore';
import { defaultBoardMapping } from './boardMapping';
import { computeAnchors } from './tockBoard';

export type BoardProps = {
  src?: string;
  className?: string;
  highlightedPositions?: Array<{type: 'RING' | 'HOME', idx: number}>;
  onPawnClick?: (pawn: any) => void;
  onPositionClick?: (position: {type: 'RING' | 'HOME', idx: number}) => void;
  children?: React.ReactNode;
};


export default function Board({
  src = '/board.png',
  className,
  highlightedPositions = [],
  onPawnClick,
  onPositionClick,
  children,
}: BoardProps) {
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);
  const { gameState, selectedPawn, setSelectedPawn, myPlayerSlot, animatingPawns, displayedCard } = useGameStore();
  const { theme } = useThemeStore();
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Couleurs plus saturées et contrastées pour le mode clair
  const colorByPlayer = theme === 'light' 
    ? ['#1d4ed8', '#b91c1c', '#15803d', '#ea580c'] // Mode clair: couleurs plus foncées
    : ['#3b82f6', '#ef4444', '#22c55e', '#fb923c']; // Mode sombre: couleurs plus claires
    
  const strokeByPlayer = theme === 'light'
    ? ['#1e3a8a', '#7f1d1d', '#14532d', '#7c2d12'] // Mode clair: strokes très foncés
    : ['#1e40af', '#991b1b', '#166534', '#9a3412']; // Mode sombre: strokes moyens
    
  const highlightFill = theme === 'light'
    ? ['rgba(29,78,216,0.35)','rgba(185,28,28,0.35)','rgba(21,128,61,0.35)','rgba(234,88,12,0.35)']
    : ['rgba(59,130,246,0.22)','rgba(239,68,68,0.22)','rgba(34,197,94,0.22)','rgba(251,146,60,0.22)'];

  const geometry = useMemo(() => defaultBoardMapping, []);
  const anchors = useMemo(() => computeAnchors(geometry as any), []);
  const activeMap = geometry; // Alias pour la géométrie du plateau
  const showGrid = false; // Grid de debug (mettre à true pour voir la grille)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPositionClick) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 1000;

    // Trouver la position la plus proche cliquée
    let closestPosition: {type: 'RING' | 'HOME', idx: number} | null = null;
    let minDistance = Infinity;

    // Vérifier les positions RING
    geometry.ring.forEach((pos, idx) => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance && distance < 30) { // Rayon de clic
        minDistance = distance;
        closestPosition = { type: 'RING', idx };
      }
    });

    // Vérifier les positions HOME
    geometry.homes.forEach((home, playerIdx) => {
      home.forEach((pos, idx) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance && distance < 30) {
          minDistance = distance;
          closestPosition = { type: 'HOME', idx: playerIdx * 5 + idx };
        }
      });
    });

    if (closestPosition) {
      onPositionClick(closestPosition);
    }
  };


  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        border: '8px solid #7a3f1d',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        
        background:
          'radial-gradient(ellipse at center, #ead7cf 0%, #d6b8ab 40%, #bd9a8a 100%)',
      }}
      aria-label="Plateau du jeu du Toc"
      role="img"
    >
      {}
      {!imageFailedToLoad && (
        <Image
          src={src}
          alt="Plateau du Toc"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          onError={() => setImageFailedToLoad(true)}
        />
      )}

      {}
      {showGrid && (
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          {}
          {Array.from({ length: 21 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={(i * 1000) / 20}
                y1={0}
                x2={(i * 1000) / 20}
                y2={1000}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={(i * 1000) / 20}
                x2={1000}
                y2={(i * 1000) / 20}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
              />
              {}
              <text
                x={(i * 1000) / 20 + 4}
                y={16}
                fontSize={14}
                fill="rgba(255,255,255,0.8)"
              >
                {i}
              </text>
              <text
                x={4}
                y={(i * 1000) / 20 - 4}
                fontSize={14}
                fill="rgba(255,255,255,0.8)"
              >
                {i}
              </text>
            </g>
          ))}
        </svg>
      )}

      {}
      <svg
        ref={svgRef}
        onClick={handleSvgClick}
          viewBox={`0 0 ${activeMap.size} ${activeMap.size}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'auto' }}
        >
        {}
        {(() => {
          const current = gameState?.currentPlayer ?? -1;

          const ringOccupants = new Map<number, { player: number }[]>();
          gameState?.pawns.forEach((pw) => {
            if (pw.location.type === 'RING') {
              const idx = pw.location.idx % activeMap.ring.length;
              const list = ringOccupants.get(idx) ?? [];
              list.push({ player: pw.player });
              ringOccupants.set(idx, list);
            }
          });

          return (
            <g>
              {activeMap.ring.map((p, i) => {
                const occ = ringOccupants.get(i);
                const isCurrentOnThis = !!occ?.some(o => o.player === current);
                
                const startStroke = [0,1,2,3].some(pl => anchors.startIndexByPlayer[pl] === i)
                  ? colorByPlayer[[0,1,2,3].find(pl => anchors.startIndexByPlayer[pl] === i)!]
                  : '#111';
                const strokeWidth = [0,1,2,3].some(pl => anchors.startIndexByPlayer[pl] === i) ? 5 : 3;
                return (
                  <circle
                    key={`ring-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={22}
                    fill={isCurrentOnThis ? highlightFill[current] : 'rgba(255,255,255,0.85)'}
                    stroke={startStroke}
                    strokeWidth={strokeWidth}
                  />
                );
              })}
            </g>
          );
        })()}

        {}
        {activeMap.homes.map((lane, player) => {
          const fillColor = colorByPlayer[player % 4];
          return (
            <g key={`home-${player}`}>
              {lane.map((p, idx) => (
                <g key={`home-${player}-${idx}`}>
                  <circle cx={p.x} cy={p.y} r={22} fill={fillColor} stroke="#111" strokeWidth={3} />
                  <text x={p.x} y={p.y + 5} fontSize={16} textAnchor="middle" fill="#111" fontWeight="700">
                    {idx + 1}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {}
        {activeMap.bases.map((cells, player) => {
          const stroke = colorByPlayer[player % 4];
          
          const baseCount = gameState?.pawns.filter(p => p.player === player && p.location.type === 'BASE').length ?? 0;
          
          const cx = cells.length ? cells.reduce((s,c)=>s+c.x,0)/cells.length : 0;
          const cy = cells.length ? cells.reduce((s,c)=>s+c.y,0)/cells.length : 0;
          return (
            <g key={`base-${player}`}>
              {cells.map((p, idx) => (
                <circle key={`base-${player}-${idx}`} cx={p.x} cy={p.y} r={24} fill="#f5f5f5" stroke={stroke} strokeWidth={4} />
              ))}
              {cells.length > 0 && (
                <g>
                  <rect x={cx-18} y={cy-38} width={36} height={22} rx={6} ry={6} fill="rgba(0,0,0,0.55)" stroke={stroke} strokeWidth={2} />
                  <text x={cx} y={cy-22} textAnchor="middle" fontSize={14} fill="#fff" fontWeight={700}>{baseCount}/4</text>
                </g>
              )}
            </g>
          );
        })}

        {}
        {gameState?.pawns.map((pawn) => {
          let pos: { x: number; y: number } | null = null;
          let isInBase = false;
          
          if (pawn.location.type === 'RING') {
            pos = activeMap.ring[pawn.location.idx % activeMap.ring.length];
          } else if (pawn.location.type === 'HOME') {
            const lane = activeMap.homes[pawn.player % activeMap.homes.length];
            pos = lane[Math.min(pawn.location.idx, lane.length - 1)];
          } else if (pawn.location.type === 'BASE') {
            
            isInBase = true;
            const basePositions = activeMap.bases[pawn.player % activeMap.bases.length];
            if (basePositions && basePositions.length > 0) {
              
              const playerPawnsInBase = gameState.pawns.filter(p => 
                p.player === pawn.player && p.location.type === 'BASE'
              );
              const pawnIndexInBase = playerPawnsInBase.indexOf(pawn);
              pos = basePositions[Math.min(pawnIndexInBase, basePositions.length - 1)];
            }
          } else if (pawn.location.type === 'FINISHED') {
            pos = activeMap.finished[pawn.player % activeMap.finished.length];
          }

          if (!pos) {
            return null;
          }

          const isSelected = selectedPawn?.id === pawn.id;
          const r = 16;

          if (isInBase) {
            const size = 20;
            return (
              <g key={`pawn-${pawn.id}`} style={{ cursor: 'pointer' }} onClick={(e) => { 
                e.stopPropagation(); 
                if (onPawnClick) {
                  onPawnClick(pawn);
                } else {
                  setSelectedPawn(pawn);
                }
              }}>
                {}
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={r + 8} fill="rgba(255,255,0,0.25)" stroke="#eab308" strokeWidth={2} />
                )}
                {}
                <line x1={pos.x - size} y1={pos.y - size} x2={pos.x + size} y2={pos.y + size} stroke={colorByPlayer[pawn.player % 4]} strokeWidth={6} strokeLinecap="round" />
                <line x1={pos.x - size} y1={pos.y + size} x2={pos.x + size} y2={pos.y - size} stroke={colorByPlayer[pawn.player % 4]} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          }

          const animation = animatingPawns.get(pawn.id);
          const isAnimating = !!animation;
          
          return (
            <g key={`pawn-${pawn.id}`} style={{ cursor: 'pointer' }} onClick={(e) => { 
              e.stopPropagation(); 
              if (onPawnClick) {
                onPawnClick(pawn);
              } else {
                setSelectedPawn(pawn);
              }
            }}>
              {}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill="rgba(255,255,0,0.25)" stroke="#eab308" strokeWidth={2} />
              )}
              
              {}
              {isAnimating && (
                <circle cx={pos.x} cy={pos.y} r={r + 6} fill="none" stroke="#3b82f6" strokeWidth={3} opacity={0.6}>
                  <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.3;0.6" dur="0.6s" repeatCount="indefinite" />
                </circle>
              )}
              
              <circle cx={pos.x} cy={pos.y} r={r} fill={colorByPlayer[pawn.player % 4]} stroke={strokeByPlayer[pawn.player % 4]} strokeWidth={4} />
              <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">{(pawn.index ?? 0) + 1}</text>
              
              {}
              {isAnimating && animation && (
                <g>
                  <rect 
                    x={pos.x - 20} 
                    y={pos.y - 40} 
                    width={40} 
                    height={24} 
                    rx={12} 
                    fill="#3b82f6" 
                    stroke="#1e3a8a" 
                    strokeWidth={2}
                  />
                  <text 
                    x={pos.x} 
                    y={pos.y - 22} 
                    textAnchor="middle" 
                    fontSize={14} 
                    fontWeight={800} 
                    fill="#fff"
                  >
                    {animation.totalSteps - animation.currentStep}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {}
        {highlightedPositions && highlightedPositions.map((highlightPos, idx) => {
          let pos: { x: number; y: number } | null = null;
          
          if (highlightPos.type === 'RING') {
            pos = activeMap.ring[highlightPos.idx % activeMap.ring.length];
          } else if (highlightPos.type === 'HOME') {
            
            const playerSlot = myPlayerSlot ?? 0;
            const lane = activeMap.homes[playerSlot % activeMap.homes.length];
            pos = lane[Math.min(highlightPos.idx, lane.length - 1)];
          }
          
          if (!pos) return null;
          
          const r = 24;
          
          return (
            <g 
              key={`highlight-${highlightPos.type}-${highlightPos.idx}`} 
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (onPositionClick) {
                  onPositionClick(highlightPos);
                }
              }}
            >
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r={r} 
                fill="rgba(34,197,94,0.3)" 
                stroke="#22c55e" 
                strokeWidth={3}
                strokeDasharray="5,5"
              />
            </g>
          );
        })}
      </svg>


      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>{children}</div>
      </div>

      {}
      {displayedCard && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            animation: 'cardPopIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              border: '4px solid #3b82f6',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
              {displayedCard.playerName} joue
            </div>
            <div 
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: displayedCard.card.suit === '♥' || displayedCard.card.suit === '♦' ? '#dc2626' : '#000',
                lineHeight: 1,
              }}
            >
              {displayedCard.card.rank}
              <span style={{ fontSize: '48px' }}>{displayedCard.card.suit}</span>
            </div>
          </div>
        </div>
      )}

      {}
      <style jsx>{`
        @keyframes cardPopIn {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

