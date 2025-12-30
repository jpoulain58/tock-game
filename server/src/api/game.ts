import { NextApiRequest, NextApiResponse } from "next";
import { TockGame } from "../game/TockGame";

const games: Record<string, TockGame> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST" && req.url?.endsWith("/create")) {
    const gameId = crypto.randomUUID();
    games[gameId] = new TockGame(4);
    res.status(200).json({ gameId });
  } else if (req.method === "POST" && req.url?.endsWith("/join")) {
    const { gameId } = req.body;
    if (!games[gameId]) return res.status(404).json({ error: "Game not found" });
    res.status(200).json({ ok: true });
  } else {
    
    res.status(404).end();
  }
}
