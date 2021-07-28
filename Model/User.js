const { Schema, model } = require("mongoose")

const user = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  currentRents: {
    type: Array,
    required: true,
  },
  token: {
    type: String,
    required: false,
  },
})

module.exports = model("User", user)
