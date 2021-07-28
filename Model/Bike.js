const { Schema, model } = require("mongoose")

const bike = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["sport", "mountain", "road"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    required: false,
  },
})

module.exports = model("Bike", bike)
