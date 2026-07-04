import multer from "multer"
import fs from "fs"

const uploadPath = "uploads/" // 🔥 use 'uploads' (better)

// create folder if not exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

export default upload