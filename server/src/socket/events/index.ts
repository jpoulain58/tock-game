import { Server } from "socket.io";
import { GamesRegistry } from "../types";
import { registerLobbyHandlers } from "./lobbyHandlers";
import { registerGameHandlers } from "./gameHandlers";
import { registerMiscHandlers } from "./miscHandlers";

export function registerSocketEvents(io: Server, games: GamesRegistry): void {
  io.on("connection", (socket) => {
    registerLobbyHandlers(io, socket, games);
    registerGameHandlers(io, socket, games);
    registerMiscHandlers(io, socket, games);
  });
}


