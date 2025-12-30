"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const TockGame_1 = require("../game/TockGame");
const games = {};
async function handler(req, res) {
    if (req.method === "POST" && req.url?.endsWith("/create")) {
        const gameId = crypto.randomUUID();
        games[gameId] = new TockGame_1.TockGame(4);
        res.status(200).json({ gameId });
    }
    else if (req.method === "POST" && req.url?.endsWith("/join")) {
        const { gameId } = req.body;
        if (!games[gameId])
            return res.status(404).json({ error: "Game not found" });
        res.status(200).json({ ok: true });
    }
    else {
        res.status(404).end();
    }
}
