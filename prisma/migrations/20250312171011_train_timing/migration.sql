/*
  Warnings:

  - Added the required column `trainUniqueId` to the `TrainTiming` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainTiming" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trainUniqueId" TEXT NOT NULL,
    "trainNo" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "sourceTime" DATETIME NOT NULL,
    "destinationTime" DATETIME NOT NULL
);
INSERT INTO "new_TrainTiming" ("destination", "destinationTime", "id", "source", "sourceTime", "trainNo") SELECT "destination", "destinationTime", "id", "source", "sourceTime", "trainNo" FROM "TrainTiming";
DROP TABLE "TrainTiming";
ALTER TABLE "new_TrainTiming" RENAME TO "TrainTiming";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
