/*
  Warnings:

  - A unique constraint covering the columns `[trainUniqueId]` on the table `TrainConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketNo" TEXT NOT NULL,
    "trainUniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bookedOn" DATETIME NOT NULL,
    "seatNo" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    CONSTRAINT "Tickets_trainUniqueId_fkey" FOREIGN KEY ("trainUniqueId") REFERENCES "TrainConfig" ("trainUniqueId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tickets" ("bookedOn", "dob", "gender", "id", "name", "phone", "seatNo", "ticketNo", "ticketType", "trainUniqueId") SELECT "bookedOn", "dob", "gender", "id", "name", "phone", "seatNo", "ticketNo", "ticketType", "trainUniqueId" FROM "Tickets";
DROP TABLE "Tickets";
ALTER TABLE "new_Tickets" RENAME TO "Tickets";
CREATE UNIQUE INDEX "Tickets_ticketNo_key" ON "Tickets"("ticketNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TrainConfig_trainUniqueId_key" ON "TrainConfig"("trainUniqueId");
