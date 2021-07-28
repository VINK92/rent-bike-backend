const Joi = require("joi")
const Bike = require("../Model/Bike")
const User = require("../Model/User")

class RentController {
  async getAllBikes(req, res, next) {
    try {
      const bikes = await Bike.find()
      res.status(200).json(bikes)
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async deleteBike(req, res, next) {
    try {
      const {
        params: { bikeId },
      } = req
      await Bike.findByIdAndRemove({ _id: bikeId })
      res.status(200)
      res.json({ message: "bike deleted" })
      res.end()
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async addBike(req, res, next) {
    try {
      const newBike = new Bike({
        name: req.body.name,
        type: req.body.type,
        price: req.body.price,
        available: req.body.available,
      })
      await newBike.save()
      res.status(201)
      res.json(newBike)
      res.end()
    } catch (e) {
      console.log("Error", e)
      return process.exit(1)
    }
  }
  async currentRents(req, res, next) {
    try {
      const {
        params: { userId },
      } = req
      const user = await User.findById({ _id: userId })

      res.status(200)
      res.json(user.currentRents)
      res.end()
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async addRent(req, res, next) {
    try {
      const {
        params: { userId },
      } = req
      const { bikeId } = req.body
      const bike = await Bike.findByIdAndUpdate({ _id: bikeId }, { available: false })
      const user = await User.findById({ _id: userId })

      const isUniq = user.currentRents.includes(bikeId)

      const updatedUser = await User.findByIdAndUpdate(
        { _id: userId },
        { currentRents: !isUniq ? [bikeId, ...user.currentRents] : [...user.currentRents] }
      )
      res.status(200)
      res.json({ updatedUser })
      res.end()
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async cancelRent(req, res, next) {
    try {
      const {
        params: { userId },
      } = req
      const { bikeId } = req.body
      const bike = await Bike.findByIdAndUpdate({ _id: bikeId }, { available: true })
      const user = await User.findById({ _id: userId })
      const updatedCurrentRents = user.currentRents.filter((rent) => rent !== bikeId)
      await User.findByIdAndUpdate({ _id: userId }, { currentRents: updatedCurrentRents })
      res.status(200)
      res.json(updatedCurrentRents)
      res.end()
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async validateId(req, res, next) {
    const {
      params: { bikeId },
    } = req
    try {
      const bike = await Bike.findById(bikeId)
      if (!bike) {
        return res.status(404).send({ message: "Not found" })
      }
      next()
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
  async validateCreateBike(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid("sport", "mountain", "road").required(),
      price: Joi.number().required(),
      available: Joi.boolean().required(),
    })

    const resValidation = validationRules.validate(req.body)

    if (resValidation.error) {
      return res.status(400).send(resValidation.error)
    }

    next()
  }
}

module.exports = new RentController()
