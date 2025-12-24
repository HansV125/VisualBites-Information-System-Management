import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

// Allowed file types for product images
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
];

// Max file size: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate uploaded file
 */
export function validateUploadedFile(file: Express.Multer.File): void {
    if (!file) {
        throw new BadRequestException('No file uploaded');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
            `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
    }

    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
            `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
        );
    }

    // Check file extension matches MIME type
    const ext = extname(file.originalname).toLowerCase();
    const validExtensions: Record<string, string[]> = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/avif': ['.avif'],
        'image/gif': ['.gif'],
    };

    const allowedExts = validExtensions[file.mimetype] || [];
    if (!allowedExts.includes(ext)) {
        throw new BadRequestException(
            `File extension doesn't match content type`
        );
    }
}

/**
 * Generate safe filename
 */
export function generateSafeFilename(originalname: string): string {
    const ext = extname(originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}${ext}`;
}
