"use strict";
const ModelUser = require("../models/Users");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const path = require( "path" );
const fs = require( 'fs' );
let emailHelper = require('../helpers/email-helper');
class UserController {
  constructor() {
    this.model_user   = new ModelUser();
    this.errors       = errors
    this.knex         = global.knex
    this.emailHelper  = new emailHelper();
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
         let userObj = await this.getProfile({email:req.body.email});
         userObj.access_token = token;
         res.json({code:200, status:"ok", userObj: userObj})
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
          created_at  : this.knex.raw("CURRENT_TIMESTAMP"),
          updated_at  : this.knex.raw("CURRENT_TIMESTAMP")
      }

      let insertUser = await this.model_user.Create(userObj);
      let user = await this.getProfile({email:data.email});
      let createToken = await this.createToken(user);
      user.access_token  = createToken.accessToken;
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
      let user = await this.getProfile({email:req.user.user_id});
       res.json({code:200, status:"ok", userObj: user})
    }catch(ex){
      console.log(ex,"-----------");
      next(this.errors.getError("ESS50001", ex));
    }
  }
  async registerFb(req,res,next){
    try{
        let data = req.body;
        let accessTokenFlag = (await this.verifyAccessToken(data.token) === data.uid) ? true : false;
        //console.log("Ree",accessTokenFlag)
        if (!accessTokenFlag) {
                next(this.errors.getError("ESS42206"));
        }
        let user = await this.model_user.Get({email:data.email,facebook_id:data.uid});
        let response ;
        if(!user){
          let userData = { facebook_id:data.uid,name : data.fullName , profile_pic: data.photoUrl,email :data.email, status:1,  created_at  :this.knex.raw("CURRENT_TIMESTAMP"),updated_at  : this.knex.raw("CURRENT_TIMESTAMP")};
          let insertUser = await this.model_user.Create(userData);
          let user = await this.model_user.Get({facebook_id:data.uid,email:data.email});
          user.token = data.token;
          let createToken = await this.createToken(user);
          user.access_token  = createToken.accessToken;
  
          delete user.password;
          response = {
            status: true,
            msg : "User created successfully",
            code:200,
            userObj: user,
            isAccountCreated : true 
          }
        }else{
          if(user.profile_pic !== data.photoUrl){
            user.profile_pic = data.photoUrl;
            await this.model_user.Update({profile_pic:data.photoUrl},{email:user.email,facebook_id:data.uid})
        }
        delete user.password;
        let createToken = await this.createToken(user);
        user.access_token  = createToken.accessToken;

        user.token = data.token;
        response = {
          status: true,
          msg : "User Login Successfull",
          code:200,
          userObj: user,
          isAccountCreated : true 
        }
      }
      
      res.json(response)
    }catch(ex){
      console.log("Exception in FB register",ex);
    }
  }
  async updatePassword(req,res,next){
    try{
      let user = req.user;
      let data = req.body;
      let verifyUser = await this.model_user.Get({id:user.user_id})
      console.log("EXist user",verifyUser);
      if(!verifyUser){
        return next(this.errors.getError("ESS42204"));
      }
      const areEqual = await bcrypt.compare(data.oldPassword, verifyUser.password);
      if (!areEqual) {
          return next(this.errors.getError("ESS42207"));
      } else {
          let encryptedPassword = await bcrypt.hash(data.newPassword,10);
          await this.model_user.Update({password:encryptedPassword},{id:user.user_id})
          res.json({code:200, status:'ok', msg : "Password Changed Successfully!"})
      }

    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS50001", ex));
    }

  }
  async forgetPassword(req,res,next){
    try{
      let email = req.body.email;
      let verifyUser = await this.model_user.Get({email:email,facebook_id:null})
      if(!verifyUser){
        return next(this.errors.getError("ESS42204"));
      }
      let opt =  Math.floor(1000 + Math.random() * 9000);
      await this.model_user.Update({password_token:opt},{id:verifyUser.id});
      let message_or_html = "<b>Need to reset your password?</b> <br> \n Use your verification code sent on your email <br><br>\n Click on the button below and enter the Verification Code <br>" + opt; ;
      let emailRespone = await this.emailHelper.sendForgetPassword(email, "Reset Password", message_or_html);
      if(emailRespone){
        res.json({code:200,status:'ok', msg:'A token has sent to your email.'})
      }
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS50001", ex));
    }

  }
  async verifyToken(req,res,next){
    try{
      let email = req.body.email;
      let token = req.body.token;
      let verifyUser = await this.model_user.Get({email:email,password_token:token})
      if(!verifyUser){
        return next(this.errors.getError("ESS42208"));
      }
      res.json({code:200,status:'ok', msg:'Token has been verified successfully.'})
      
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS50001", ex));
    }

  }
  async resetPassword(req,res,next){
    try{
      let email           = req.body.email;
      let password        = req.body.password;
      let confirmPassword = req.body.confirmPassword;
      let verifyUser = await this.model_user.Get({email:email,facebook_id:null})
      if(!verifyUser){
        return next(this.errors.getError("ESS42204"));
      }
      if(password !== confirmPassword){
        return next(this.errors.getError("ESS42209"));
      }
      let encryptedPassword = await bcrypt.hash(password, 10);
      let userObj = {
          password    : encryptedPassword,
          updated_at  : this.knex.raw("CURRENT_TIMESTAMP")
      }
      await this.model_user.Update(userObj,{id:verifyUser.id});
      res.json({code:200,status:'ok', msg:"Password updated successfully!"})
     

      
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS50001", ex));
    }

  }
  async updateProfile(req,res,next){
    try{
      let user_id = req.user.user_id;
      req.body.updated_at = this.knex.raw("CURRENT_TIMESTAMP");
      let updateUser = await this.model_user.Update(req.body,{id:user_id});
      if(updateUser){
        let userObj = await this.getProfile({id:user_id});
        res.json({code:200, status:'ok', msg:'User updated successfully.', userObj:userObj})
      }
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS50001", ex));
    }

  }
  async verifyAccessToken(token){
    let jwtObject = jwt.decode(token);
    return jwtObject.user_id;

  }

  async getProfile(obj){
    let userObj = await this.model_user.Get(obj);
    delete userObj.password;
    delete userObj.newPasswordToken;
    delete userObj.forgetPasswordTimestamp;
    this.getProfilePicUrl(userObj);
    return userObj;

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
      let path = "";
      if(user.profile_pic){
        path = process.env.BASE_URL+"upload/"+user.profile_pic;
      }
    
      user.profile_pic = path;
    }catch(ex){
      console.log("Error in get profile pic",ex);
      user.profile_pic = "";
      return "";

    }
       

  }

  
}

module.exports = UserController;
