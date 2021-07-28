const { Router } = require("express")
const router = Router()
const rentController = require("../controllers/rent.controller")
const usersController = require("../controllers/users.controller")

router.get("/bikes", rentController.getAllBikes)
router.post("/bikes/new", rentController.validateCreateBike, rentController.addBike)
router.post("/bikes/delete/:bikeId", rentController.validateId, rentController.deleteBike)
router.post("/bikes/new-rent/:userId", rentController.addRent)
router.get("/current/:userId", rentController.currentRents)

router.post("/current/cancel/:userId", rentController.cancelRent)

module.exports = router
