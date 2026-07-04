import mongoose from "mongoose"

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 🔥 capital U better
    required: true
  },
  name: String,
  age: Number,
  dob: String,
  phone: String,
  gender: String,
  className: String,
  schoolName: String,
  avatar: String
}, { timestamps: true })

const Profile = mongoose.model("Profile", profileSchema)

export default Profile