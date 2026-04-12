-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "score1" INTEGER NOT NULL DEFAULT 0,
    "score2" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "revealedTiles" BOOLEAN[],
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");
