import { Router } from 'express'
import multer from 'multer'

import { verifyAuth } from './middlewares'

const storage = multer.memoryStorage()
const upload = multer({ storage })

import { uploadProfileImage } from './controllers'

export const restRouter = Router()

restRouter.post(
  '/uploads',
  verifyAuth,
  upload.single('avatar'),
  uploadProfileImage
)
