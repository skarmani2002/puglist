"use strict";
const ModelUser = require("../models/Users");
const jwt = require('jsonwebtoken');

class UserController {
  constructor() {
    this.model_user = new ModelUser();
     }

  async login(req, res, next) {
    try {

    } catch (ex) {
      console.log(ex,"-----------");
      next(this.errors.getError("ESS50001", ex));
    }
  }
  async register(req, res, next) {
    try {
      let data = req.body;
      var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      console.log("REG",data,ip);
    } catch (ex) {
      console.log(ex);
      
      next(this.errors.getError("ESS50001", ex));
    }
  }

  
}

module.exports = UserController;
