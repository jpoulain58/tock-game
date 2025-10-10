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

export type Anchors = {
  ringSize: number;
  startIndexByPlayer: number[];
  homeEntryIndexByPlayer: number[];
};

export function distanceSq(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function closestIndex(points: Point[], target: Point): number {
  let bestIdx = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length; i++) {
    const d = distanceSq(points[i], target);
    if (d < best) {
      best = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function nextIndex(i: number, steps: number, size: number): number {
  return (i + ((steps % size) + size)) % size;
}

export function computeAnchors(mapping: BoardMapping): Anchors {
  const ring = mapping.ring;
  const ringSize = ring.length;
  const targets: Point[] = [
    { x: 500, y: 735 },
    { x: 265, y: 500 },
    { x: 735, y: 500 },
    { x: 500, y: 265 },
  ];

  const homeEntryIndexByPlayer = (mapping.homeEntryOverrideByPlayer && mapping.homeEntryOverrideByPlayer.length === 4)
    ? mapping.homeEntryOverrideByPlayer.map((p) => closestIndex(ring, p))
    : targets.map((t) => closestIndex(ring, t));

  const xs = ring.map(p => p.x);
  const ys = ring.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const TL: Point = { x: minX, y: minY };
  const TR: Point = { x: maxX, y: minY };
  const BR: Point = { x: maxX, y: maxY };
  const BL: Point = { x: minX, y: maxY };

  const center: Point = { x: mapping.size / 2, y: mapping.size / 2 };
  const d = Math.round(mapping.size * 0.16);
  const plusTL: Point = { x: center.x - d, y: center.y - d };
  const plusTR: Point = { x: center.x + d, y: center.y - d };
  const plusBR: Point = { x: center.x + d, y: center.y + d };
  const plusBL: Point = { x: center.x - d, y: center.y + d };

  const startTargets: Point[] = (mapping.startOverrideByPlayer && mapping.startOverrideByPlayer.length === 4)
    ? mapping.startOverrideByPlayer
    : [plusBL, plusTL, plusBR, plusTR];
  const startBlue  = closestIndex(ring, startTargets[0]);
  const startRed   = closestIndex(ring, startTargets[1]);
  const startGreen = closestIndex(ring, startTargets[2]);
  const startOrange= closestIndex(ring, startTargets[3]);
  const startIndexByPlayer = [startBlue, startRed, startGreen, startOrange];

  return { ringSize, startIndexByPlayer, homeEntryIndexByPlayer };
}

export function canEnterHome(player: number, ringIndex: number, anchors: Anchors): boolean {
  return anchors.homeEntryIndexByPlayer[player % 4] === ringIndex;
}

export function advanceHomeIndex(currentIdx: number, steps: number, laneLength: number): number | null {
  const target = currentIdx + steps;
  if (target < 0 || target >= laneLength) return null;
  return target;
}

export function deriveMapping(mapping: BoardMapping): BoardMapping {
  const size = mapping.size;
  const center: Point = { x: size / 2, y: size / 2 };
  const anchors = computeAnchors(mapping);

  const homes = mapping.homes?.length === 4 && mapping.homes.some(l => l.length) ? mapping.homes : (() => {
    const steps = 18;
    const spacing = 13;
    const lanes: Point[][] = [[], [], [], []];
    for (let p = 0; p < 4; p++) {
      const entryPt = mapping.ring[anchors.homeEntryIndexByPlayer[p]];
      const dir = normalize({ x: center.x - entryPt.x, y: center.y - entryPt.y });
      const lane: Point[] = [];
      for (let i = 1; i <= steps; i++) {
        lane.push({ x: entryPt.x + dir.x * spacing * i, y: entryPt.y + dir.y * spacing * i });
      }
      lanes[p] = lane;
    }
    return lanes;
  })();

  const bases = mapping.bases?.length === 4 && mapping.bases.some(b => b.length) ? mapping.bases : guessBasesFromEntries(mapping);

  const finished = mapping.finished?.length === 4 ? mapping.finished : (() => {
    const offset = 110;
    return [
      { x: center.x, y: center.y + offset },
      { x: center.x - offset, y: center.y },
      { x: center.x + offset, y: center.y },
      { x: center.x, y: center.y - offset },
    ];
  })();

  return { size, ring: mapping.ring, homes, bases, finished };
}

export function guessBasesFromEntries(mapping: BoardMapping): Point[][] {
  const size = mapping.size;
  const center: Point = { x: size / 2, y: size / 2 };
  const targets: Point[] = [
    { x: 500, y: 735 },
    { x: 265, y: 500 },
    { x: 735, y: 500 },
    { x: 500, y: 265 },
  ];
  const entries = targets.map((t) => closestIndex(mapping.ring, t));

  const baseDist = 100;
  const baseSpacing = 48;
  const result: Point[][] = [[], [], [], []];
  for (let p = 0; p < 4; p++) {
    const entryPt = mapping.ring[entries[p]];
    const inward = normalize({ x: center.x - entryPt.x, y: center.y - entryPt.y });
    const outward = { x: -inward.x, y: -inward.y };
    const perp = normalize({ x: -outward.y, y: outward.x });
    const a = add(entryPt, scale(outward, baseDist));
    const b = add(a, scale(perp, baseSpacing / 2));
    const c = add(a, scale(perp, -baseSpacing / 2));
    const d = add(b, scale(outward, baseSpacing));
    const e = add(c, scale(outward, baseSpacing));
    result[p] = [c, b, e, d];
  }
  return result;
}

function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}
function scale(v: Point, s: number): Point { return { x: v.x * s, y: v.y * s }; }
function add(a: Point, b: Point): Point { return { x: a.x + b.x, y: a.y + b.y }; }
