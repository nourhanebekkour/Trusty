import multer from 'multer';

// Utilisation de la mémoire pour stocker temporairement le fichier avant l'upload vers MinIO
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Uniquement images et PDF.'), false);
    }
  }
});

export default upload;
