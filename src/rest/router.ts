import { Router } from "express"
import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage })

import { uploadProfileImage } from "./controllers"

export const restRouter = Router()

restRouter.post("/uploads/profile", upload.single("avatar"), uploadProfileImage)
