-- CreateTable
CREATE TABLE "TrainConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trainUniqueId" TEXT NOT NULL,
    "config" JSONB NOT NULL
);
