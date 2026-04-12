"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
let GameGateway = class GameGateway {
    gameService;
    server;
    waitingClient = null;
    activeTimers = new Map();
    constructor(gameService) {
        this.gameService = gameService;
    }
    async handleJoin(data, client) {
        const result = await this.gameService.joinGame(data.username);
        if (!result.match) {
            this.waitingClient = client;
            client.emit('gameUpdate', result);
            return;
        }
        const roomId = result.match.id;
        client.join(roomId);
        if (this.waitingClient) {
            this.waitingClient.join(roomId);
        }
        this.waitingClient = null;
        this.server.to(roomId).emit('gameUpdate', result);
        this.startTimer(roomId);
    }
    async handleGuess(data) {
        const result = await this.gameService.submitGuess(data.roundId, data.guess, data.playerId);
        if (!result.matchId)
            return;
        this.server.to(result.matchId).emit('gameUpdate', result);
        this.startTimer(result.matchId);
    }
    startTimer(roomId) {
        if (this.activeTimers.has(roomId)) {
            clearInterval(this.activeTimers.get(roomId));
        }
        let time = 5;
        const interval = setInterval(() => {
            this.server.to(roomId).emit('timer', { time });
            time--;
            if (time < 0) {
                clearInterval(interval);
                this.activeTimers.delete(roomId);
                this.server.to(roomId).emit('timerEnd', {
                    message: "⏰ Time Up!",
                });
                this.handleTimeout(roomId);
            }
        }, 1000);
        this.activeTimers.set(roomId, interval);
    }
    async handleTimeout(roomId) {
        try {
            const match = await this.gameService.getMatchById(roomId);
            if (!match)
                return;
            const nextTurn = match.player1Id === match.currentTurnId
                ? match.player2Id
                : match.player1Id;
            const updatedMatch = await this.gameService.updateTurn(roomId, nextTurn);
            this.server.to(roomId).emit('gameUpdate', {
                message: "⏰ Turn skipped!",
                match: updatedMatch,
            });
        }
        catch (err) {
            console.log("Timeout error", err);
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGame'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('guess'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleGuess", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map