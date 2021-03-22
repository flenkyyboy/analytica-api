const csv = require("csvtojson");
// const csvFilePath = './public/products.csv'
const Data = require("../models/data-model");
const Sessions = require("../models/session-model");
const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const User = require('../models/user-model')
const model_helper = require("../models/helpers/index.helper");

module.exports.createSession = async (req, res) => {
  try {
    const jsonObj = await csv({ checkType: true }).fromFile(req.file.path);
    model_helper.validateProperty(jsonObj);
    const totalProductValue = model_helper.addTotalPrice(jsonObj);
    const dataObj = {
      _id: new mongoose.Types.ObjectId(),
      data: totalProductValue,
    };
    const newData = new Data(dataObj);
    newData.save(async (errr, data) => {
      if (errr) {
        res.status(500).json({
          message: 'Upload Failed',
          error: errr
        })
        fs.unlinkSync(req.file.path);
      } else {
        const sessObj = {
          _id: new mongoose.Types.ObjectId(),
          created_by: req.userData.userId,
          data: data._id,
        };
        const newSess = new Sessions(sessObj);
        newSess.save(async (err, user) => {
          if (err) {
            res.status(500).json({
              message: 'Upload Failed',
              error: err
            })
          } else {
            res.status(200).json({
              message: 'Session Created'
            })
          }
        });
        fs.unlinkSync(req.file.path);
      }
    });
  } catch (err) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({
      message: 'Upload Failed',
      error: err
    })
  }
};
module.exports.getSessions = async (req, res) => {
  const pageNo = req.query.page;
  if (req.userData.adminId === 'employee') {
    var userId = req.userData.adminId
  } else {
    var userId = req.userData.userId;
  }
  const { allSession, totalSession } = await model_helper.getSession(
    userId,
    pageNo
  );
  res.status(201).json({
    sessions: allSession
  })
};
module.exports.deleteSession = async (req, res) => {
  Sessions.findOneAndDelete({ _id: req.params.id }).then((sessionData) => {
    Data.findByIdAndDelete({ _id: sessionData.data }, (err) => {
      if (err) console.log(err);
    });
    res.status(200).json({
      message: "Session deleted"
    })
  }).catch(() => {
    res.status(500).json({
      message: "Session deleted failed"
    })
  })
};
module.exports.viewSession = async (req, res) => {
  const data = await Data.findOne({ _id: req.params.id });
  res.send(data._id);
};

module.exports.getSessionData = async (req, res) => {
  const data = await Data.findById(req.params.id)
  res.status(201).json(data)
}
module.exports.viewAllSesions = async (req, res) => {
  const pageNo = req.query.page;
  const { allSession, totalSession } = await model_helper.viewAllSession(pageNo)
  res.status(201).json({
    sessions: allSession
  })
}
