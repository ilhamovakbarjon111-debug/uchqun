import multer from 'multer';

// Use memory storage for Railway (ephemeral filesystem)
const storage = multer.memoryStorage();

export const uploadChildPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    },
});
