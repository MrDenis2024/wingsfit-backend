import multer from 'multer';
import path from 'path';
import {promises as fs} from 'fs';
import config from './config';
import {randomUUID} from 'node:crypto';

const imageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const destDir = path.join(config.publicPath, 'images');
    await fs.mkdir(destDir, { recursive: true });
    cb(null, config.publicPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const newFilename = randomUUID() + extension;
    cb(null, 'images/' + newFilename);
  },
});

export const imagesUpload = multer({storage: imageStorage});