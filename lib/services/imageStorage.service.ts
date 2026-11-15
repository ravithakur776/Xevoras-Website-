import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

export interface UploadedMediaResult {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export class ImageStorageService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ];
  private static readonly MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

  /**
   * Ensures the persistent target upload directory exists.
   */
  public static ensureUploadDirectory() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Persists a binary buffer as a real image file and registers it in the database.
   */
  public static async saveImageBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    altText?: string
  ): Promise<UploadedMediaResult> {
    this.ensureUploadDirectory();

    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(`Unsupported image MIME type: ${mimeType}. Allowed types: JPEG, PNG, WebP, AVIF.`);
    }

    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds the 15MB limit. Current size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Determine extension
    let ext = path.extname(originalName).toLowerCase();
    if (!ext || ext === '.') {
      if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('avif')) ext = '.avif';
      else ext = '.jpg';
    }

    // Generate collision-resistant unique filename
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const filename = `${safeBase}-${uniqueId}${ext}`;
    const destinationPath = path.join(this.UPLOAD_DIR, filename);

    // Write file to filesystem
    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/products/${filename}`;

    // Persist to MediaAsset table in database
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url: publicUrl,
        mimeType,
        sizeBytes: buffer.length,
        altText: altText || originalName,
      },
    });

    return {
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
    };
  }

  /**
   * Handles base64 data URI uploads (common in drag-and-drop and canvas crops).
   */
  public static async saveBase64Image(dataUri: string, originalName: string = 'product-image.jpg', altText?: string): Promise<UploadedMediaResult> {
    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data URI format.');
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    return this.saveImageBuffer(buffer, originalName, mimeType, altText);
  }

  /**
   * Retrieves media assets with pagination and optional search filter.
   */
  public static async listMediaAssets(options?: { search?: string; take?: number; skip?: number }) {
    const take = options?.take || 50;
    const skip = options?.skip || 0;
    const where = options?.search
      ? {
          OR: [
            { filename: { contains: options.search } },
            { altText: { contains: options.search } },
          ],
        }
      : {};

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return { assets, total };
  }

  /**
   * Deletes a media asset record and unlinks its file from storage.
   */
  public static async deleteMediaAsset(id: string): Promise<boolean> {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return false;

    const filePath = path.join(this.UPLOAD_DIR, asset.filename);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (e) {
      console.warn(`Failed to unlink file on disk: ${filePath}`, e);
    }

    await prisma.mediaAsset.delete({ where: { id } });
    return true;
  }
}
