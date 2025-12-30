import { PawnLocation } from "@/store/gameStore";

const RING_SIZE = 72;
const HOME_ENTRIES = [71, 18, 54, 36];

export function calculateAnimationPath(
  from: PawnLocation,
  to: PawnLocation,
  steps: number,
  playerSlot: number
): PawnLocation[] {
  const path: PawnLocation[] = [];

  if (from.type === "BASE" && to.type === "RING") {
    path.push(to);
    return path;
  }

  if (from.type === "RING" && to.type === "RING") {
    const start = from.idx;
    const direction = steps > 0 ? 1 : -1;
    const absSteps = Math.abs(steps);

    for (let i = 1; i <= absSteps; i++) {
      const idx = (start + direction * i + RING_SIZE) % RING_SIZE;
      path.push({ type: "RING", idx });
    }
    return path;
  }

  if (from.type === "RING" && to.type === "HOME") {
    const start = from.idx;
    const homeEntry = HOME_ENTRIES[playerSlot];
    
    let stepsToEntry = 0;
    for (let i = 1; i <= steps; i++) {
      const idx = (start + i) % RING_SIZE;
      path.push({ type: "RING", idx });
      if (idx === homeEntry) {
        stepsToEntry = i;
        break;
      }
    }

    const stepsInHome = steps - stepsToEntry - 1;
    for (let i = 0; i <= stepsInHome; i++) {
      if (i <= to.idx) {
        path.push({ type: "HOME", idx: i });
      }
    }
    return path;
  }

  if (from.type === "HOME" && to.type === "HOME") {
    for (let i = from.idx + 1; i <= to.idx; i++) {
      path.push({ type: "HOME", idx: i });
    }
    return path;
  }

  if (from.type === "HOME" && to.type === "FINISHED") {
    for (let i = from.idx + 1; i <= 3; i++) {
      path.push({ type: "HOME", idx: i });
    }
    path.push({ type: "FINISHED" });
    return path;
  }

  path.push(to);
  return path;
}

export function calculateAnimationDuration(steps: number): number {
  return Math.max(300, steps * 300);
}

export function calculateStepInterval(totalSteps: number): number {
  return 300;
}

