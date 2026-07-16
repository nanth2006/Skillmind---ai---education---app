import Profile from "../models/Profile.js"
import { uploadToCloudinary } from "../utils/upload.js"

// ✅ CREATE
export const createProfile = async (req, res) => {
  try {
    let avatar = ""

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "skillmind/avatars")
      avatar = result.secure_url
    }

    const profile = new Profile({
      ...req.body,
      userId: req.user.id,
      avatar,
    })

    await profile.save()
    res.json(profile)

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message })
  }
}

// ✅ GET
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ✅ UPDATE
export const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "skillmind/avatars")
      updateData.avatar = result.secure_url
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true }
    )

    res.json(profile)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}