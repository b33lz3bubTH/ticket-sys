-- CreateTable
CREATE TABLE "TrainTiming" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trainNo" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "sourceTime" DATETIME NOT NULL,
    "destinationTime" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bookedOn" DATETIME NOT NULL,
    "seatNo" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_ticketNo_key" ON "Tickets"("ticketNo");
