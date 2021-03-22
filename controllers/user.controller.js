
const mongoose = require("mongoose");
const User = require('../models/user-model')


module.exports.createUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(409).json({
      message: "Email already Exist"
    })
  } else {
    const userObj = {
      "_id": new mongoose.Types.ObjectId(),
      "name": req.body.name,
      "email": req.body.email,
      "password": req.body.password,
      "role": req.userData.role === "admin" ? "employee" : "admin",
      "admin_id": req.userData.userId
    }
    const newUser = new User(userObj)
    newUser.save(async (err, user) => {
      if (err) {
        res.status(500).json({
          message: "User Not created"
        })
      } else {
        res.status(201).json({
          message: "User created"
        })
      }
    })
  }
}
module.exports.getUsers = async (req, res) => {
  const allUser = await User.find({ admin_id: req.userData.userId }).lean()
  res.status(200).json({
    Users: allUser
  })
}
module.exports.deleteUser = async (req, res) => {
   User.deleteOne({ _id: req.params.id }).then(()=>{
     res.status(200).json({
       message:"User Deleted "
     })
   }).catch((err)=>{
    res.status(500).json({
      message:"User Delete Failed ",
      error:err
    })
   })
};
module.exports.getOneUser = (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (!err) {
      res.render('edit-user', { user })
    }
  }).lean();
}
module.exports.editUser = (req, res) => {
  const userObj = {
    "name": req.body.name,
    "email": req.body.email,
    "password": req.body.password,
  }
  User.findByIdAndUpdate(req.params.id, userObj, { new: true }).exec((err, doc) => {
    if (err) {
      res.status(500).json({
        message:"Updated Failed"
      })
    } else {
      res.status(201).json({
        message:"Updated Success"
      })
    }
  })
}