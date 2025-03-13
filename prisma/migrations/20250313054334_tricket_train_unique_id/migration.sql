/*
  Warnings:

  - Added the required column `trainUniqueId` to the `Tickets` table without a default value. This is not possible if the table is not empty.

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
    "ticketType" TEXT NOT NULL
);
INSERT INTO "new_Tickets" ("bookedOn", "dob", "gender", "id", "name", "phone", "seatNo", "ticketNo", "ticketType") SELECT "bookedOn", "dob", "gender", "id", "name", "phone", "seatNo", "ticketNo", "ticketType" FROM "Tickets";
DROP TABLE "Tickets";
ALTER TABLE "new_Tickets" RENAME TO "Tickets";
CREATE UNIQUE INDEX "Tickets_ticketNo_key" ON "Tickets"("ticketNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
