"use strict";
const ModelUser = require("../models/Users");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const path = require( "path" );
const fs = require( 'fs' );
class UserController {
  constructor() {
    this.model_user = new ModelUser();
    this.errors = errors
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
      let verifyUser = await this.model_user.Get({email:data.email})
      if(verifyUser){
        return next(this.errors.getError("ESS42202"));
      }
      let encryptedPassword = await bcrypt.hash(data.password, 10);
      console.log("User is new");
      let userObj = {
          name        : data.name,
          email       : data.email, 
          password    : encryptedPassword,
          gender      : data.gender,
          profile_pic : data.profile_pic,
          status      : 1,
         // created_at  : new Date().getTime(),
         // updated_at  : new Date().getTime() 
      }

      let insertUser = await this.model_user.Create(userObj);
      let user = await this.model_user.Get({email:data.email});
      
      const filename = path.basename( user.profile_pic );
      let folder = 'C:/Projects/puglist/storage/users';
      const absolutePath = path.resolve( folder, filename );
      user.profile_pic =absolutePath
      let createToken = await this.createToken(user);
      delete user.password;

      user.token  = createToken.accessToken;
      if(insertUser){
        res.json({
          code:200, 
          status: 'ok', 
          userObj :user
        })
      }
    } catch (ex) {
      console.log(ex);
      
      next(this.errors.getError("ESS50001", ex));
    }
  }
  async createToken(user) {
    const secret= '$ecret2021'
    const expiresIn=  '86400'
    const userAdd = { id: user. id ,email:user.email };
    const accessToken = jwt.sign(userAdd, secret);
    return {
        expiresIn,
        accessToken,
    };
}

  
}

module.exports = UserController;
