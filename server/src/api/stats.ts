import { Router, Request, Response } from "express";
import { getUserGameHistory, getUserStats } from "../services/gameService";
import { verifyToken } from "../utils/jwt";

const router = Router();

// Middleware d'authentification
const authenticate = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Token invalide" });
  }

  (req as any).userId = decoded.userId;
  next();
};

// GET /api/stats/history - Récupérer l'historique des parties
router.get("/history", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const history = await getUserGameHistory(userId);
    
    // Formater les données pour le frontend
    const formattedHistory = history.map((game: any) => ({
      id: game.id,
      date: game.endedAt,
      players: game.gamePlayers.map((gp: any) => gp.playerName),
      winner: game.scores[0]?.winningTeam === game.gamePlayers.find((gp: any) => gp.userId === userId)?.team ? "win" : "loss",
      winningTeam: game.scores[0]?.winningTeam,
    }));

    res.json({ history: formattedHistory });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/stats/user - Récupérer les statistiques de l'utilisateur
router.get("/user", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = await getUserStats(userId);
        console.log('DEBUG getUserStats - userId:', userId, 'stats:', stats);
    
    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;


