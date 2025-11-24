-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "s3Key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "parsedTitle" TEXT NOT NULL,
    "parsedYear" INTEGER,
    "parsedQuality" TEXT,
    "parsedSource" TEXT,
    "tmdbId" INTEGER,
    "tmdbMetadata" JSONB,
    "metadataStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_s3Key_key" ON "videos"("s3Key");
