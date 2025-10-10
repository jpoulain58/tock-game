import type { Anchors, BoardMapping, Point } from './tockBoard';
import { nextIndex, canEnterHome, advanceHomeIndex } from './tockBoard';

export type MoveResult = {
  type: 'ring' | 'enter_home' | 'home' | 'blocked' | 'invalid';
  ringIndex?: number;
  homeIndex?: number;
  reason?: string;
};

export type CardValue =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export function stepsForCard(card: CardValue): number[] | 'split7' | 'swapJ' | 'exitOrAdvance' {
  switch (card) {
    case 'A': return 'exitOrAdvance';
    case 'K': return 'exitOrAdvance';
    case '2': return [2];
    case '3': return [3];
    case '4': return [-4];
    case '5': return [5];
    case '6': return [6];
    case '7': return 'split7';
    case '8': return [8];
    case '9': return [9];
    case '10': return [10];
    case 'Q': return [12];
    case 'J': return 'swapJ';
  }
}

export function moveOnRing(currentIndex: number, steps: number, anchors: Anchors): number {
  return nextIndex(currentIndex, steps, anchors.ringSize);
}

export function tryEnterHome(
  player: number,
  ringIndex: number,
  steps: number,
  anchors: Anchors,
  homeLength: number,
): MoveResult {
  if (!canEnterHome(player, ringIndex, anchors)) {
    return { type: 'invalid', reason: 'not-on-home-entry' };
  }
  const remaining = steps - 1;
  if (remaining < 0) {
    return { type: 'invalid', reason: 'negative-steps' };
  }
  const target = advanceHomeIndex(0, remaining, homeLength);
  if (target == null) return { type: 'blocked', reason: 'home-overflow' };
  return { type: 'enter_home', homeIndex: target };
}
