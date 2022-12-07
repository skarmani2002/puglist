"use strict";
const ModelUser = require("../models/Users");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const path = require( "path" );
const fs = require( 'fs' );
class UserController {
  constructor() {
    this.model_user   = new ModelUser();
    this.errors       = errors
    this.knex         = global.knex
  }

  async login(req, res, next) {
    try {
      let user = await this.model_user.Get({email:req.body.email})
      let password = req.body.password;
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user.id, email:user.email },
          process.env.TOKEN_KEY,
          {
            expiresIn: process.env.EXPIRE_IN
          }
        );
         // save user token
         user.token = token;
         delete user.password;
         this.getProfilePicUrl(user);
         res.json({code:200, status:"ok", userObj: user})
      }
     return  next(this.errors.getError("ESS42204"));
  
       
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
          created_at  :this.knex.raw("CURRENT_TIMESTAMP"),
          updated_at  : this.knex.raw("CURRENT_TIMESTAMP")
      }

      let insertUser = await this.model_user.Create(userObj);
      let user = await this.model_user.Get({email:data.email});
      this.getProfilePicUrl(user);
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
  async profile(req,res,next){
    try{
      console.log("sd",req.user);
      let user = await this.model_user.Get({email:req.user.email});
      delete user.password;
      this.getProfilePicUrl(user);
      res.json({code:200, status:"ok", userObj: user})
    }catch(ex){
      console.log(ex,"-----------");
      next(this.errors.getError("ESS50001", ex));
    }
  }
  async createToken(user) {
    const secret= process.env.TOKEN_KEY;
    const expiresIn=   process.env.EXPIRE_IN
    const userAdd = { id: user.id ,email:user.email };
    const accessToken = jwt.sign(userAdd, secret);
    return {
        expiresIn,
        accessToken,
    };
  }
  getProfilePicUrl(user){
    try{
      const filename = path.basename( user.profile_pic );
      let folder = './storage/users';
      const absolutePath = path.resolve( folder, filename );
      user.profile_pic = absolutePath
    }catch(ex){
      console.log("Error in get profile pic",ex);
      return "";
    }
       

  }

  
}

module.exports = UserController;
