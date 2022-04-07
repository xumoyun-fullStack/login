consts router = require("express").Router();

router.get("/", (req, res) => {
    res.send("Login and Register API!");
})

module.exports = {
    path: "/",
    router
}