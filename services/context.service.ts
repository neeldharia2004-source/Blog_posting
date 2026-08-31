import { prisma } from "@/lib/prisma";
import { ContextExtractor } from "@/lib/context-extractor";
import fs from "fs/promises";
import path from "path";

export class ContextService {
  private static UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "context");
  private static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

  private static async ensureDirectory(dirPath: string) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // already exists
    }
  }

  static async getByProjectId(projectId: string) {
    return prisma.contextFile.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.contextFile.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  static async createFromFile(
    projectId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string
  ) {
    // 1. Enforce file size limit
    if (fileBuffer.length > this.MAX_FILE_SIZE) {
      throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB maximum limit.`);
    }

    // 2. Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    // 2. Extract text
    const { text } = await ContextExtractor.extract(fileBuffer, originalFileName, mimeType);

    // 3. Save physical file to public/uploads/context/<projectId>/
    const projectDir = path.join(this.UPLOAD_DIR, projectId);
    await this.ensureDirectory(projectDir);

    const safeFileName = `${Date.now()}_${originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fullFilePath = path.join(projectDir, safeFileName);
    const relativeUrl = `/uploads/context/${projectId}/${safeFileName}`;

    await fs.writeFile(fullFilePath, fileBuffer);

    // 4. Save to Database
    return prisma.contextFile.create({
      data: {
        projectId,
        fileName: originalFileName,
        fileType: mimeType || "application/octet-stream",
        filePath: relativeUrl,
        storageReference: fullFilePath,
        extractedContent: text,
      },
    });
  }

  static async createFromText(
    projectId: string,
    title: string,
    content: string
  ) {
    // 1. Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    const cleanedText = content.trim();
    if (!cleanedText) throw new Error("Context content cannot be empty.");

    const formattedFileName = title.endsWith(".txt") ? title : `${title}.txt`;

    return prisma.contextFile.create({
      data: {
        projectId,
        fileName: formattedFileName,
        fileType: "text/plain",
        filePath: null,
        storageReference: "direct_text_input",
        extractedContent: cleanedText,
      },
    });
  }

  static async delete(id: string) {
    const contextFile = await prisma.contextFile.findUnique({ where: { id } });
    if (!contextFile) throw new Error("Context file not found");

    // Delete physical file if present
    if (contextFile.storageReference && contextFile.storageReference !== "direct_text_input") {
      try {
        await fs.unlink(contextFile.storageReference);
      } catch (err) {
        console.warn("Could not delete physical context file on disk:", err);
      }
    }

    return prisma.contextFile.delete({
      where: { id },
    });
  }
}
