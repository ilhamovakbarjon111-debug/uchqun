import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import { Client as AppwriteClient, Storage as AppwriteStorage, ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

let storage;
let bucket;
let appwriteClient;
let appwriteStorage;
let appwriteBucketId;
let appwriteProjectId;
const localUploadsRoot = process.env.LOCAL_UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const localMediaDir = path.join(localUploadsRoot, 'media');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Always ensure local folders exist for fallback/local dev usage
ensureDir(localMediaDir);
const appwriteConfigured = Boolean(
  process.env.APPWRITE_ENDPOINT &&
  process.env.APPWRITE_PROJECT_ID &&
  process.env.APPWRITE_API_KEY &&
  process.env.APPWRITE_BUCKET_ID
);

// Initialize Appwrite Storage if configured
if (appwriteConfigured) {
  try {
    appwriteClient = new AppwriteClient()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    appwriteStorage = new AppwriteStorage(appwriteClient);
    appwriteBucketId = process.env.APPWRITE_BUCKET_ID;
    appwriteProjectId = process.env.APPWRITE_PROJECT_ID;
    console.log('✓ Appwrite Storage initialized');
  } catch (error) {
    console.warn('⚠ Failed to initialize Appwrite Storage:', error.message);
    console.warn('⚠ Falling back to other storage options');
  }
}

// Initialize Google Cloud Storage if configured
if (process.env.GCP_PROJECT_ID && process.env.GCS_BUCKET_NAME) {
  try {
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      // Credentials will be loaded from environment variables or service account key file
      // GOOGLE_APPLICATION_CREDENTIALS or default credentials
    });
    bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    console.log('✓ Google Cloud Storage initialized');
  } catch (error) {
    console.warn('⚠ Failed to initialize Google Cloud Storage:', error.message);
    console.warn('⚠ Falling back to local file storage');
  }
}

/**
 * Upload file to storage (Appwrite preferred, GCS fallback)
 * @param {Buffer|Stream} file - File buffer or stream
 * @param {string} filename - Destination filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, filename, mimetype) {
  // Prefer Appwrite if configured
  if (appwriteConfigured) {
    try {
      if (!appwriteStorage || !appwriteBucketId) {
        throw new Error('Appwrite storage not initialized');
      }
      const buffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
      const createdFile = await appwriteStorage.createFile(
        appwriteBucketId,
        ID.unique(),
        InputFile.fromBuffer(buffer, filename),
        {
          contentType: mimetype,
        }
      );

      const baseEndpoint = process.env.APPWRITE_ENDPOINT.replace(/\/+$/, '');
      const url = `${baseEndpoint}/storage/buckets/${appwriteBucketId}/files/${createdFile.$id}/view?project=${appwriteProjectId}`;

      return {
        url,
        path: createdFile.$id,
      };
    } catch (err) {
      // If Appwrite fails and fallback allowed, continue to local storage
      if (process.env.LOCAL_STORAGE_FALLBACK !== 'false') {
        console.warn('⚠ Appwrite upload failed, falling back to local storage:', err.message);
      } else {
        throw err;
      }
    }
  }

  if (bucket && process.env.NODE_ENV === 'production') {
    // Upload to Google Cloud Storage
    const blob = bucket.file(filename);
    const stream = blob.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
      public: true, // Make files publicly accessible (adjust based on your needs)
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        // Make file public
        await blob.makePublic();
        
        const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        resolve({
          url,
          path: filename,
        });
      });

      if (Buffer.isBuffer(file)) {
        stream.end(file);
      } else {
        file.pipe(stream);
      }
    });
  }

  // Local disk fallback (development/unstaged environments)
  const buffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
  const safeName = filename || `upload-${Date.now()}`;
  const destination = path.join(localMediaDir, safeName);
  await fs.promises.writeFile(destination, buffer);

  // URL is served statically from Express (/uploads)
  const urlPath = `/uploads/media/${safeName}`;

  return {
    url: urlPath,
    path: destination,
  };
}

/**
 * Delete file from storage
 * @param {string} filepath - File path or filename
 * @returns {Promise<void>}
 */
export async function deleteFile(filepath) {
  if (appwriteConfigured) {
    if (!appwriteStorage || !appwriteBucketId) {
      throw new Error('Appwrite storage not initialized');
    }
    let fileId = filepath;
    // If a full Appwrite URL was provided, extract the file id from it
    try {
      if (fileId.startsWith('http')) {
        const url = new URL(fileId);
        // URL pattern: /storage/buckets/{bucketId}/files/{fileId}/view
        const match = url.pathname.match(/\/files\/([^/]+)\//);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
    } catch {
      // Ignore URL parsing errors and fall back to the provided value
    }

    await appwriteStorage.deleteFile(appwriteBucketId, fileId);
    return;
  }

  if (bucket && process.env.NODE_ENV === 'production') {
    // Delete from Google Cloud Storage
    const filename = getFilename(filepath);
    const blob = bucket.file(filename);
    await blob.delete();
    return;
  }

  // Local fallback deletion
  try {
    const localPath = filepath.startsWith('/uploads')
      ? path.join(process.cwd(), filepath.replace('/uploads', 'uploads'))
      : filepath;
    await fs.promises.unlink(localPath);
  } catch {
    // Ignore if already deleted or path invalid
  }
}

/**
 * Generate signed URL for private file access (if needed)
 * @param {string} filename - File filename
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>}
 */
export async function getSignedUrl(filename, expiresIn = 3600) {
  if (appwriteConfigured) {
    if (!appwriteStorage || !appwriteBucketId) {
      throw new Error('Appwrite storage not initialized');
    }
    const baseEndpoint = process.env.APPWRITE_ENDPOINT.replace(/\/+$/, '');
    return `${baseEndpoint}/storage/buckets/${appwriteBucketId}/files/${filename}/view?project=${appwriteProjectId}`;
  }

  if (bucket && process.env.NODE_ENV === 'production') {
    const blob = bucket.file(getFilename(filename));
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }

  throw new Error('No storage configured. Please set Appwrite or GCS credentials.');
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function getFilename(filepath) {
  if (!filepath) return '';
  // If it's a URL, extract the last path segment
  try {
    if (filepath.startsWith('http')) {
      const url = new URL(filepath);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] || '';
    }
  } catch {
    // Fall through to basename handling
  }
  return path.basename(filepath);
}
