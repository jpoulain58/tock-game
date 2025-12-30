"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketEvents = registerSocketEvents;
const lobbyHandlers_1 = require("./lobbyHandlers");
const gameHandlers_1 = require("./gameHandlers");
const miscHandlers_1 = require("./miscHandlers");
function registerSocketEvents(io, games) {
    io.on("connection", (socket) => {
        (0, lobbyHandlers_1.registerLobbyHandlers)(io, socket, games);
        (0, gameHandlers_1.registerGameHandlers)(io, socket, games);
        (0, miscHandlers_1.registerMiscHandlers)(io, socket, games);
    });
}
