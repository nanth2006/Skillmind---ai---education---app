import multer from "multer"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// memory la store pannும் (Vercel-safe, disk illa)
const storage = multer.memoryStorage()
const upload = multer({ storage })

// buffer ah cloudinary ku upload panra helper
export const uploadToCloudinary = (fileBuffer, folder = "skillmind") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        if (result) resolve(result)
        else reject(error)
      }
    )
    stream.end(fileBuffer)
  })
}

export default upload