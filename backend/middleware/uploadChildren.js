import multer from 'multer';
import path from 'path';
import fs from 'fs';

const childrenDir = path.join(process.cwd(), 'uploads/children');
if (!fs.existsSync(childrenDir)) {
    fs.mkdirSync(childrenDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, childrenDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `child-${req.params.id}-${unique}${path.extname(file.originalname)}`);
    },
});

export const uploadChildPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files allowed'), false);
    },
});
