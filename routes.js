import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/rotor", (req, res) => {
    res.render("rotor");
});

export default router;