const { Router } = require("express")
const router = Router()
const usersController = require("../controllers/users.controller")

router.post("/auth/register", usersController.validateUser, usersController.register)
router.post("/auth/login", usersController.validateUser, usersController.login)
router.post("/auth/logout", usersController.authorize, usersController.logout)
router.get("/users/current", usersController.authorize, usersController.getCurrentUser)
router.patch("/users/:userId", usersController.authorize, usersController.validateUserSubscription, usersController.upDateSubscription)

module.exports = router
