const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadsDir = path.join(__dirname, '../../uploads/logos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new AppError('Logo must be a JPEG, PNG, WEBP, or GIF image', 400));
};

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const optionalLogoUpload = (req, res, next) => {
  uploadLogo.single('logo')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('Logo file size cannot exceed 2MB', 400));
      return;
    }

    next(error);
  });
};

const getLogoAbsolutePath = (logoPath) => {
  if (!logoPath) return null;

  const filename = path.basename(logoPath);
  return path.join(uploadsDir, filename);
};

const deleteLogoFile = (logoPath) => {
  const absolutePath = getLogoAbsolutePath(logoPath);

  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return;
  }

  fs.unlinkSync(absolutePath);
};

module.exports = {
  optionalLogoUpload,
  deleteLogoFile,
};
