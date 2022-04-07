const { SignUPPOST, LoginPOST } = require("../controllers/UserController");

const router = require("express").Router();

router.post("/signup", SignUPPOST);
router.post("/login", LoginPOST);

module.exports = {
    path: "/users",
    router
};