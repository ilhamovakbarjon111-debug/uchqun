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
const fileBaseUrl = (process.env.FILE_BASE_URL || process.env.PUBLIC_API_URL || '').replace(/\/+$/, '');
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
    console.log('✓ Appwrite Storage initialized', {
      endpoint: process.env.APPWRITE_ENDPOINT,
      projectId: process.env.APPWRITE_PROJECT_ID,
      bucketId: appwriteBucketId,
    });
  } catch (error) {
    console.warn('⚠ Failed to initialize Appwrite Storage:', error.message);
    console.warn('⚠ Falling back to other storage options');
  }
} else {
  console.warn('⚠ Appwrite Storage not configured. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_BUCKET_ID');
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
        const error = new Error('Appwrite storage not initialized');
        console.error('❌ Appwrite storage check failed:', {
          hasStorage: !!appwriteStorage,
          hasBucketId: !!appwriteBucketId,
          bucketId: appwriteBucketId,
        });
        throw error;
      }

      console.log('📤 Starting Appwrite upload:', {
        filename,
        mimetype,
        bucketId: appwriteBucketId,
        projectId: appwriteProjectId,
        endpoint: process.env.APPWRITE_ENDPOINT,
      });

      const buffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
      const fileId = ID.unique();
      
      console.log('📤 Creating file in Appwrite:', {
        fileId,
        filename,
        size: buffer.length,
        bucketId: appwriteBucketId,
      });

      // Create file with proper permissions and content type
      const createdFile = await appwriteStorage.createFile(
        appwriteBucketId,
        fileId,
        InputFile.fromBuffer(buffer, filename),
        [
          'read("any")', // Allow anyone to read the file (for public bucket)
        ]
      );

      console.log('✓ Appwrite file created:', {
        fileId: createdFile.$id,
        name: createdFile.name,
        sizeOriginal: createdFile.sizeOriginal,
        mimeType: createdFile.mimeType,
        uploadedMimeType: mimetype,
      });

      const baseEndpoint = process.env.APPWRITE_ENDPOINT.replace(/\/+$/, '');
      // Appwrite file URL format
      // For public buckets: /storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
      // For private buckets or CORS issues: use /preview endpoint
      // Preview endpoint works for both public and private files and handles CORS better
      const isVideo = mimetype.startsWith('video/');
      const isImage = mimetype.startsWith('image/');
      
      // Use preview endpoint for better CORS support and compatibility
      // Preview endpoint works for both public and private files
      const url = `${baseEndpoint}/storage/buckets/${appwriteBucketId}/files/${createdFile.$id}/preview?project=${appwriteProjectId}`;
      
      console.log('✓ Generated Appwrite URL:', {
        url,
        isVideo,
        isImage,
        mimetype,
        endpoint: 'preview', // Using preview endpoint for better CORS support
      });

      console.log('✓ Appwrite file uploaded successfully:', {
        fileId: createdFile.$id,
        filename,
        url,
        size: buffer.length,
      });

      return {
        url,
        path: createdFile.$id,
      };
    } catch (err) {
      // Log detailed error information
      console.error('❌ Appwrite upload error:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        } : null,
        stack: err.stack,
        filename,
        mimetype,
        bucketId: appwriteBucketId,
        projectId: appwriteProjectId,
        endpoint: process.env.APPWRITE_ENDPOINT,
      });

      // In production, never fallback to local storage - throw error instead
      if (process.env.NODE_ENV === 'production') {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        const errorCode = err.code || err.response?.status || 'UNKNOWN';
        throw new Error(`Appwrite upload failed (${errorCode}): ${errorMessage}. Check Appwrite credentials, bucket permissions, and endpoint connectivity.`);
      }
      // In development, allow fallback if explicitly enabled
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

  // Local disk fallback (development/unstaged environments only)
  // In production, we should use Appwrite or GCS, not local storage
  if (process.env.NODE_ENV === 'production' && !appwriteConfigured && !bucket) {
    throw new Error(
      'Storage not configured for production. Please configure Appwrite (APPWRITE_*) or Google Cloud Storage (GCP_*) environment variables.'
    );
  }

  const buffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
  const safeName = filename || `upload-${Date.now()}`;
  const destination = path.join(localMediaDir, safeName);
  
  // Ensure directory exists
  ensureDir(localMediaDir);
  await fs.promises.writeFile(destination, buffer);

  // URL is served statically from Express (/uploads)
  const urlPath = `/uploads/media/${safeName}`;
  const absoluteUrl = fileBaseUrl ? `${fileBaseUrl}${urlPath}` : urlPath;

  // Log warning in production if using local storage
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠ WARNING: Using local storage in production. Files will be lost on container restart. Configure Appwrite or GCS for persistent storage.');
  }

  return {
    url: absoluteUrl,
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
    try {
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
    } catch (err) {
      if (process.env.LOCAL_STORAGE_FALLBACK !== 'false') {
        console.warn('⚠ Appwrite delete failed, falling back to local delete:', err.message);
      } else {
        throw err;
      }
    }
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
    let localPath = filepath;
    if (filepath.startsWith('http')) {
      try {
        const urlObj = new URL(filepath);
        localPath = urlObj.pathname.replace('/uploads', 'uploads');
      } catch {
        // fallback to raw filepath
      }
    }
    if (localPath.startsWith('/uploads')) {
      localPath = path.join(process.cwd(), localPath.replace('/uploads', 'uploads'));
    }
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
