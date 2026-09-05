-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BespokeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isNearCompany" BOOLEAN NOT NULL DEFAULT false,
    "materialDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BespokeRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BespokeRequest" ("createdAt", "customerId", "description", "id", "requestNumber", "status", "updatedAt") SELECT "createdAt", "customerId", "description", "id", "requestNumber", "status", "updatedAt" FROM "BespokeRequest";
DROP TABLE "BespokeRequest";
ALTER TABLE "new_BespokeRequest" RENAME TO "BespokeRequest";
CREATE UNIQUE INDEX "BespokeRequest_requestNumber_key" ON "BespokeRequest"("requestNumber");
CREATE TABLE "new_BridalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isNearCompany" BOOLEAN NOT NULL DEFAULT false,
    "materialDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BridalRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BridalRequest" ("createdAt", "customerId", "description", "id", "requestNumber", "status", "updatedAt") SELECT "createdAt", "customerId", "description", "id", "requestNumber", "status", "updatedAt" FROM "BridalRequest";
DROP TABLE "BridalRequest";
ALTER TABLE "new_BridalRequest" RENAME TO "BridalRequest";
CREATE UNIQUE INDEX "BridalRequest_requestNumber_key" ON "BridalRequest"("requestNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
