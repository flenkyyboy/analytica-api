const express = require("express");
const index_controller = require("../controllers/index.controller");
const user_controller = require("../controllers/user.controller");
const User = require("../models/user-model");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const jwt = require('jsonwebtoken')
const checkAuth = require('./middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage });

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(500).json({
        message: "User not Found"
      })
    }
    if (user.password === req.body.password) {
      const token = jwt.sign({
        email: user.email,
        userId: user._id,
        role: user.role,
        adminId: user.admin_id
      },
        "SECRET",
        {
          expiresIn: "1h"
        })
      return res.status(200).json({
        message: "User Logged In ",
        token: token
      })
    }
    return res.status(500).json({
      message: "password wrong"
    })
  } catch (error) {
    return res.status(500).json({
      error: error
    })
  }
});
router.get("/session", checkAuth, checkSuperAdmin,index_controller.getSessions);

router.post("/upload", checkAuth, checkEmployee, upload.single("datafile"), index_controller.createSession);

router.get("/delete-session/:id", checkAuth, checkEmployee, index_controller.deleteSession);

router.get('/view-users', checkAuth, checkEmployee, user_controller.getUsers)

router.post('/create-user', checkAuth, checkEmployee, user_controller.createUser)

router.get('/delete-user/:id', checkAuth, checkEmployee, user_controller.deleteUser)

router.post('/edit-user/:id', checkAuth, checkEmployee, user_controller.editUser)

router.get('/get-session-data/:id', checkEmployee, checkAuth, index_controller.getSessionData)



function checkEmployee(req, res, next) {
  if (req.userData.role === 'employee') {
    res.status(403).json({
      message: "Access Denied"
    })
  } else {
    next()
  }
}
function checkSuperAdmin(req, res, next) {
  if (req.userData.role === 'super-admin') {
    index_controller.viewAllSesions(req, res)
  } else {
    next()
  }
}
module.exports = router;
