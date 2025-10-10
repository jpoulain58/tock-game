'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/store/gameStore';
import { defaultBoardMapping } from './boardMapping';
import { computeAnchors } from './tockBoard';

export type BoardProps = {
  
  src?: string;
  
  className?: string;
  
  showGrid?: boolean;
  
  children?: React.ReactNode;
  
  calibrate?: boolean;
  
  mapping?: BoardMapping;
  
  onMappingChange?: (m: BoardMapping) => void;
  
  highlightedPositions?: Array<{type: 'RING' | 'HOME', idx: number}>;
  
  onPawnClick?: (pawn: any) => void;
  
  onPositionClick?: (position: {type: 'RING' | 'HOME', idx: number}) => void;
};

export type Point = { x: number; y: number };
export type BoardMapping = {
  size: number; 
  ring: Point[]; 
  homes: Point[][]; 
  bases: Point[][]; 
  finished: Point[]; 
  
  startOverrideByPlayer?: Point[]; 
  homeEntryOverrideByPlayer?: Point[]; 
};

export default function Board({
  src = '/board.png',
  className,
  showGrid = false,
  children,
  calibrate = false,
  mapping,
  onMappingChange,
  highlightedPositions = [],
  onPawnClick,
  onPositionClick,
}: BoardProps) {
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);
  const { gameState, selectedPawn, setSelectedPawn, myPlayerSlot, animatingPawns, displayedCard } = useGameStore();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const defaultGeometry = useMemo(() => {
    return defaultBoardMapping;
  }, []);

  const geometry: BoardMapping = useMemo(() => {
    if (mapping) return mapping;
    return defaultGeometry;
  }, [mapping, defaultGeometry]);

  const [localMap, setLocalMap] = useState<BoardMapping>(geometry);
  const activeMap = calibrate ? localMap : geometry;
  const anchors = useMemo(() => computeAnchors(activeMap as any), [activeMap]);

  const [group, setGroup] = useState<'ring' | 'home0' | 'home1' | 'home2' | 'home3' | 'base0' | 'base1' | 'base2' | 'base3' | 'finished'>('ring');
  const [step, setStep] = useState<number>(50);

  const addPoint = (p: Point) => {
    setLocalMap((prev) => {
      const clone: BoardMapping = JSON.parse(JSON.stringify(prev));
      switch (group) {
        case 'ring':
          clone.ring.push(p);
          break;
        case 'finished':
          clone.finished.push(p);
          break;
        default: {
          const [kind, sIdxStr] = group.startsWith('home') ? ['home', group.slice(4)] : ['base', group.slice(4)];
          const sIdx = Number(sIdxStr);
          if (kind === 'home') clone.homes[sIdx].push(p);
          else clone.bases[sIdx].push(p);
        }
      }
      onMappingChange?.(clone);
      return clone;
    });
  };

  const handleSvgClick: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!calibrate) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * activeMap.size;
    const y = ((e.clientY - rect.top) / rect.height) * activeMap.size;
    addPoint({ x, y });
  };

  const undo = () => {
    setLocalMap((prev) => {
      const clone: BoardMapping = JSON.parse(JSON.stringify(prev));
      switch (group) {
        case 'ring':
          clone.ring.pop();
          break;
        case 'finished':
          clone.finished.pop();
          break;
        default: {
          const [kind, sIdxStr] = group.startsWith('home') ? ['home', group.slice(4)] : ['base', group.slice(4)];
          const sIdx = Number(sIdxStr);
          if (kind === 'home') clone.homes[sIdx].pop();
          else clone.bases[sIdx].pop();
        }
      }
      onMappingChange?.(clone);
      return clone;
    });
  };

  const clear = () => {
    setLocalMap((prev) => {
      const clone: BoardMapping = JSON.parse(JSON.stringify(prev));
      switch (group) {
        case 'ring':
          clone.ring = [];
          break;
        case 'finished':
          clone.finished = [];
          break;
        default: {
          const [kind, sIdxStr] = group.startsWith('home') ? ['home', group.slice(4)] : ['base', group.slice(4)];
          const sIdx = Number(sIdxStr);
          if (kind === 'home') clone.homes[sIdx] = [];
          else clone.bases[sIdx] = [];
        }
      }
      onMappingChange?.(clone);
      return clone;
    });
  };

  const exportMap = async () => {
    const text = JSON.stringify(localMap, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      
      console.info('[Board] Cartographie copiée dans le presse-papiers');
    } catch {
      
      console.log(text);
    }
  };

  const getActiveList = (m: BoardMapping): Point[] => {
    if (group === 'ring') return m.ring;
    if (group === 'finished') return m.finished;
    const [kind, idxStr] = group.startsWith('home') ? ['home', group.slice(4)] : ['base', group.slice(4)];
    const idx = Number(idxStr);
    return kind === 'home' ? m.homes[idx] : m.bases[idx];
  };

  const addRelative = (dx: number, dy: number) => {
    setLocalMap((prev) => {
      const clone: BoardMapping = JSON.parse(JSON.stringify(prev));
      const list = getActiveList(clone);
      const last = list[list.length - 1] ?? { x: activeMap.size / 2, y: activeMap.size / 2 };
      const next = { x: last.x + dx, y: last.y + dy };
      list.push(next);
      onMappingChange?.(clone);
      return clone;
    });
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

          const colorByPlayer = ['#2563eb', '#dc2626', '#16a34a', '#fb923c']; 
          const highlightFill = ['rgba(37,99,235,0.22)','rgba(220,38,38,0.22)','rgba(22,163,74,0.22)','rgba(251,146,60,0.22)'];
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
          
          const colorByPlayer = ['#2563eb', '#dc2626', '#16a34a', '#fb923c']; 
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
          const colorByPlayer = ['#2563eb', '#dc2626', '#16a34a', '#fb923c'];
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
          const colorByPlayer = ['#2563eb', '#dc2626', '#16a34a', '#fb923c'];
          const strokeByPlayer = ['#1e3a8a', '#7f1d1d', '#14532d', '#7c2d12'];

          let pos: { x: number; y: number } | null = null;
          let isInBase = false;
          
          if (pawn.location.type === 'RING') {
            pos = activeMap.ring[pawn.location.idx % activeMap.ring.length];
            console.log(`🎯 Pion ${pawn.id} sur RING index ${pawn.location.idx}, position:`, pos);
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
            console.warn(`⚠️ Pion ${pawn.id} n'a pas de position valide:`, pawn.location);
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

      {calibrate && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            pointerEvents: 'auto',
            zIndex: 4,
          }}
        >
          <div style={{ fontWeight: 700 }}>Calibration</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ring','home0','home1','home2','home3','base0','base1','base2','base3','finished'].map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g as any)}
                style={{
                  background: group === g ? '#60a5fa' : '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Pas</span>
            <input
              style={{ width: 64 }}
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value) || 0)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: 4 }}>
              <div />
              <button onClick={() => addRelative(0, -step)} style={{ padding: 4, borderRadius: 6, border: 'none', cursor: 'pointer' }}>↑</button>
              <div />
              <button onClick={() => addRelative(-step, 0)} style={{ padding: 4, borderRadius: 6, border: 'none', cursor: 'pointer' }}>←</button>
              <button onClick={() => addRelative(0, 0)} style={{ padding: 4, borderRadius: 6, border: 'none', cursor: 'pointer' }}>•</button>
              <button onClick={() => addRelative(step, 0)} style={{ padding: 4, borderRadius: 6, border: 'none', cursor: 'pointer' }}>→</button>
              <div />
              <button onClick={() => addRelative(0, step)} style={{ padding: 4, borderRadius: 6, border: 'none', cursor: 'pointer' }}>↓</button>
              <div />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={undo} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Undo</button>
            <button onClick={clear} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Clear</button>
            <button onClick={exportMap} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Exporter</button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Cliquez sur le plateau pour ajouter des points dans le groupe courant.
          </div>
        </div>
      )}

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

