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
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GameService = class GameService {
    static { GameService_1 = this; }
    prisma;
    static playersQueue = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async joinGame(username) {
        let player = await this.prisma.player.findUnique({
            where: { username }
        });
        if (!player) {
            player = await this.prisma.player.create({
                data: { username }
            });
        }
        const alreadyInQueue = GameService_1.playersQueue.find((p) => p.id === player.id);
        if (alreadyInQueue) {
            return { message: "Player already in queue", player };
        }
        GameService_1.playersQueue.push(player);
        if (GameService_1.playersQueue.length === 2) {
            const [player1, player2] = GameService_1.playersQueue;
            const match = await this.prisma.match.create({
                data: {
                    player1Id: player1.id,
                    player2Id: player2.id,
                    status: "ONGOING",
                    score1: 0,
                    score2: 0,
                    currentTurnId: player1.id
                }
            });
            const round = await this.prisma.round.create({
                data: {
                    matchId: match.id,
                    word: "GAME",
                    revealedTiles: [false, false, false, false]
                }
            });
            GameService_1.playersQueue = [];
            return {
                message: "Match started",
                match: {
                    ...match,
                    player1Name: player1.username,
                    player2Name: player2.username
                },
                round,
                player
            };
        }
        return {
            message: "Waiting for another player...",
            player
        };
    }
    async submitGuess(roundId, guess, playerId) {
        const round = await this.prisma.round.findUnique({
            where: { id: roundId }
        });
        if (!round)
            return { message: "Round not found" };
        const match = await this.prisma.match.findUnique({
            where: { id: round.matchId }
        });
        if (!match)
            return { message: "Match not found" };
        if (match.currentTurnId !== playerId) {
            return {
                message: "⛔ Not your turn",
                matchId: match.id,
                match,
                round
            };
        }
        const player1 = await this.prisma.player.findUnique({
            where: { id: match.player1Id }
        });
        const player2 = await this.prisma.player.findUnique({
            where: { id: match.player2Id }
        });
        const resultArray = this.checkGuess(round.word, guess);
        const isCorrect = resultArray.every(v => v === true);
        const nextTurn = match.player1Id === playerId
            ? match.player2Id
            : match.player1Id;
        if (isCorrect) {
            await this.prisma.round.update({
                where: { id: roundId },
                data: { winnerId: playerId }
            });
            let updatedMatch;
            if (match.player1Id === playerId) {
                updatedMatch = await this.prisma.match.update({
                    where: { id: match.id },
                    data: {
                        score1: { increment: 1 },
                        currentTurnId: nextTurn
                    }
                });
            }
            else if (match.player2Id === playerId) {
                updatedMatch = await this.prisma.match.update({
                    where: { id: match.id },
                    data: {
                        score2: { increment: 1 },
                        currentTurnId: nextTurn
                    }
                });
            }
            return {
                message: "🎉 Correct Guess!",
                matchId: match.id,
                match: {
                    ...updatedMatch,
                    player1Name: player1?.username,
                    player2Name: player2?.username
                },
                round: { ...round, winnerId: playerId },
                result: resultArray
            };
        }
        const updatedMatch = await this.prisma.match.update({
            where: { id: match.id },
            data: { currentTurnId: nextTurn }
        });
        return {
            message: "❌ Try Again",
            matchId: match.id,
            match: {
                ...updatedMatch,
                player1Name: player1?.username,
                player2Name: player2?.username
            },
            round,
            result: resultArray
        };
    }
    async getMatchById(matchId) {
        return this.prisma.match.findUnique({
            where: { id: matchId }
        });
    }
    async updateTurn(matchId, nextTurnId) {
        return this.prisma.match.update({
            where: { id: matchId },
            data: { currentTurnId: nextTurnId }
        });
    }
    checkGuess(word, guess) {
        const result = [];
        for (let i = 0; i < word.length; i++) {
            result.push(word[i] === guess[i]);
        }
        return result;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameService);
//# sourceMappingURL=game.service.js.map