const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../Model/User")

class UsersController {
  async register(req, res, next) {
    try {
      const isUniqueEmail = await User.findOne({ email: req.body.email })
      if (isUniqueEmail) {
        return res.status(409).send({
          message: "Email in use",
        })
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 14)
      const newUser = await User.create({
        ...req.body,
        password: hashedPassword,
      })

      res.status(201).json(newUser)
    } catch (error) {
      res.status(400).send(error)
    }
  }
  async login(req, res, next) {
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        return res.status(401).send("Authentication is failed")
      }
      const isValidPassword = bcrypt.compare(req.body.password, user.password)
      if (!isValidPassword) {
        return res.status(401).send("Authentication is failed")
      }
      const token = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET
      )
      await User.findOneAndUpdate({ email: req.body.email }, { token: token })
      return res.status(201).json({ token })
    } catch (error) {
      res.status(400).send(error)
    }
  }
  async logout(req, res, next) {
    try {
      const { _id } = req.user
      const user = await User.findByIdAndUpdate(_id, { token: null })
      res.status(204).json(user)
    } catch (error) {
      res.status(401).send({
        message: "Not authorized",
      })
    }
  }
  async validateUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    })

    const resValidation = validationRules.validate(req.body)

    if (resValidation.error) {
      return res.status(400).send(resValidation.error)
    }

    next()
  }
  async authorize(req, res, next) {
    try {
      const authHeader = req.get("Authorization")
      if (!authHeader) {
        return res.status(401).send("User is unauthorize")
      }
      const token = authHeader.replace("Bearer ", "")
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      const { userId } = payload
      const user = await User.findById(userId)
      if (!user) {
        return res.status(401).send("User is unauthorize")
      }
      req.user = user
    } catch (error) {
      res.status(401).send(error)
    }
    next()
  }
  async getCurrentUser(req, res, next) {
    try {
      const { _id } = req.user
      const user = await User.findById(_id)
      res.status(200).json({ email: user.email, subscription: user.subscription })
    } catch (error) {
      res.status(401).send({
        message: "Not authorized",
      })
    }
  }
  async validateUserSubscription(req, res, next) {
    const validationRules = Joi.object({
      subscription: Joi.string().valid("free", "pro", "premium").required(),
    })

    const validationResult = validationRules.validate(req.body)

    if (validationResult.error) {
      return res.status(400).send(validationResult.error.message)
    }

    next()
  }
  async upDateSubscription(req, res, next) {
    const {
      params: { userId },
    } = req

    try {
      const updatedUser = await User.findOneAndUpdate(userId, req.body.subscription, { new: true })
      res.status(200).json(updatedUser)
    } catch (error) {
      console.log("Error: ", error)
      process.exit(1)
    }
  }
}

module.exports = new UsersController()
