import { prisma } from "../utils/prisma";
import { GameSession } from "../socket/types";

export async function createGameInDB(gameId: string, hostSocketId: string, session: GameSession) {
  try {
    // Créer la partie dans la DB
    const game = await prisma.game.create({
      data: {
        id: gameId,
        hostUserId: hostSocketId, // On utilise le socketId pour l'instant
        status: "started",
        startedAt: new Date(),
        state: session.game.state as any,
        options: {},
      },
    });

    // Créer les entrées pour les joueurs
    for (const player of session.players) {
      await prisma.gamePlayer.create({
        data: {
          gameId: gameId,
          playerName: player.name,
          playerSlot: player.slot,
          team: player.team,
          joinedAt: new Date(),
        },
      });
    }

    return game;
  } catch (error) {
    console.error("Erreur lors de la création de la partie en DB:", error);
    return null;
  }
}

export async function saveGameResult(
  gameId: string,
  winnerTeam: number,
  session: GameSession
) {
  try {
    // Mettre à jour la partie
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: "finished",
        endedAt: new Date(),
        state: session.game.state as any,
      },
    });

    // Sauvegarder le score
    await prisma.score.create({
      data: {
        gameId: gameId,
        winningTeam: winnerTeam,
        pointsTeam0: winnerTeam === 0 ? 1 : 0,
        pointsTeam1: winnerTeam === 1 ? 1 : 0,
      },
    });

    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du résultat:", error);
    return false;
  }
}

export async function getUserGameHistory(userId: string) {
  try {
    const games = await prisma.game.findMany({
      where: {
        gamePlayers: {
          some: {
            userId: userId,
          },
        },
        status: "finished",
      },
      include: {
        gamePlayers: true,
        scores: true,
      },
      orderBy: {
        endedAt: "desc",
      },
      take: 50, // Limiter à 50 dernières parties
    });

    return games;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return [];
  }
}

export async function getUserStats(userId: string) {
  try {
    const games = await prisma.game.findMany({
      where: {
        gamePlayers: {
          some: {
            userId: userId,
          },
        },
        status: "finished",
      },
      include: {
        gamePlayers: {
          where: {
            userId: userId,
          },
        },
        scores: true,
      },
    });

    const totalGames = games.length;
    let wins = 0;

    for (const game of games) {
      const playerTeam = game.gamePlayers[0]?.team;
      const score = game.scores[0];
      
      if (score && score.winningTeam === playerTeam) {
        wins++;
      }
    }

    return {
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
    };
  } catch (error) {
    console.error("Erreur lors du calcul des stats:", error);
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    };
  }
}


