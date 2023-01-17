"use strict";
const ModelUser   = require("../models/Users");
const jwt         = require('jsonwebtoken');
const bcrypt      = require("bcrypt");
const path        = require( "path" );
const fs          = require( 'fs' );
let emailHelper   = require('../helpers/email-helper');
const ModelMatch  = require('../models/Match');
const guid = require('guid');

class UserController {
  constructor() {
    this.model_user   = new ModelUser();
    this.errors       = errors
    this.knex         = global.knex
    this.emailHelper  = new emailHelper();
    this.model_match  = new ModelMatch();
  }
  async login(req, res, next) {
    try {
      let user = await this.model_user.Get({email:req.body.email,facebook_id:null})
      let password = req.body.password;
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { id: user.id, email:user.email },
          process.env.TOKEN_KEY,
          {
           // expiresIn: process.env.EXPIRE_IN
          }
        );
         // save user token
         let userObj = await this.getProfile({id:user.id});
         userObj.access_token = token;
         res.json({code:200, status:"ok", userObj: userObj})
      }
     return  next(this.errors.getError("ESS42204"));
  
    } catch (ex) {
      console.log(ex,"-----------");
      next(this.errors.getError("ESS42205", ex));
    }
  }
  async register(req, res, next) {
    try {
      let data = req.body;
      var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      let verifyUser = await this.model_user.Get({email:data.email,facebook_id:null})
      if(verifyUser){
        return next(this.errors.getError("ESS42202"));
      }
      if(data.profile_pic){
        data.profile_pic = process.env.BASE_URL+"upload/"+data.profile_pic;
      }
      let encryptedPassword = await bcrypt.hash(data.password, 10);
      let userObj = {
          name        : data.name,
          email       : data.email, 
          password    : encryptedPassword,
          gender      : data.gender,
          profile_pic : data.profile_pic,
          status      : 1,
          created_at  : this.knex.raw("CURRENT_TIMESTAMP"),
          updated_at  : this.knex.raw("CURRENT_TIMESTAMP"),
          salt        : guid.raw()
      }

      let insertUser = await this.model_user.Create(userObj);
      let user = await this.getProfile({id:insertUser[0]});
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
      next(this.errors.getError("ESS42205", ex));
    }
  }
  async profile(req,res,next){
    try{
      let user = await this.getProfile({id:req.user.id});
      /*let matchDetail = await this.model_match.GetAll({user_id:req.user.id});
      for(let match of matchDetail){
         let userDetail = await this.model_user.Get({id:match.oponent_id});
         if(userDetail){
          match.OponentDetail =  await this.getProfile({email:userDetail.email});;
         }
         
      }
      user.Match = matchDetail*/
      /*let whoLikesMe =  await this.model_match.GetAll({oponent_id:req.user.id,is_like:1});
      for(let match of whoLikesMe){
        let userDetail = await this.model_user.Get({id:match.user_id});
        if(userDetail){
         match.OponentDetail =  await this.getProfile({email:userDetail.email});
        }
      }
      user.whoLikesMe = whoLikesMe*/


      // Who dislike me 
    /*  let whoDisLikesMe =  await this.model_match.GetAll({oponent_id:req.user.id,is_like:0});
      for(let match of whoDisLikesMe){
        let userDetail = await this.model_user.Get({id:match.user_id});
        if(userDetail){
         match.OponentDetail =  await this.getProfile({email:userDetail.email});
        }
      }
      user.whoDisLikesMe = whoDisLikesMe*/

      // Fight Match
      let fightMatchAll = await this.model_match.getfightMatch(req.user.id);
      let fightMatchAllArrray= [];
      if(fightMatchAll){
     
      for(let singlematch of fightMatchAll ){
        if(singlematch.oponent_id == req.user.id ){
          let userData = await this.getProfile({id:singlematch.user_id});
          if(userData.id != req.user.id){
            fightMatchAllArrray.push(userData)
          }
          
        }
      }
    }

      let allUsers = await this.model_user.GetAll({status:1});
      let allUserObj =[];
      for(let user of allUsers){
        if(user.email == req.user.email){
          continue;
        }

        let result = fightMatchAllArrray.filter(function(v) {
          return v.email === user.email; // Filter out the appropriate one
        });
        if(result.length==0){
        console.log("Lattest TEst",result);
        if(user.facebook_id == null){
          user.profile_pic =   this.getProfilePicUrl(user)
        }
        await this.getUserShort(user)
        user.OponentDetail =  await this.getProfile({id:user.id});
        allUserObj.push(user)
      }
       /* for(let fa of fightMatchAllArrray){

          if(user.email !=fa.email){
            user.OponentDetail =  await this.getProfile({email:user.email});
            console.log("USER PUSH",user.email,user.id)
            allUserObj.push(user)
          }
        }*/
       
      }  
      user.fightMatch = fightMatchAllArrray;
      user.allUserObj = allUserObj;
      res.json({code:200, status:"ok", userObj: user})
    }catch(ex){
      console.log(ex,"-----------");
      next(this.errors.getError("ESS42205", ex));
    }
  }

  async registerFb(req,res,next){
    try{
        let data = req.body;
        let user = await this.model_user.Get({facebook_id:data.uid});
        let response ;
        if(!user){
          let userData = { facebook_id:data.uid,name : data.fullName , profile_pic: data.photoUrl,email :data.email, status:1,  created_at  :this.knex.raw("CURRENT_TIMESTAMP"),updated_at  : this.knex.raw("CURRENT_TIMESTAMP"),salt : guid.raw()};
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
  async registerFb_x(req,res,next){
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
      next(this.errors.getError("ESS42205", ex));
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
      next(this.errors.getError("ESS42205", ex));
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
      next(this.errors.getError("ESS42205", ex));
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
      next(this.errors.getError("ESS42211", ex));
    }

  }
  async updateProfile(req,res,next){
    try{
      let user_id = req.user.id;
      req.body.updated_at = this.knex.raw("CURRENT_TIMESTAMP");
      console.log("Req Body",req.body)
      if(req.body.profile_pic){
        req.body.profile_pic = process.env.BASE_URL+"upload/"+req.body.profile_pic;
      }
      let updateUser = await this.model_user.Update(req.body,{id:user_id});
      if(updateUser){
        let userObj = await this.getProfile({id:user_id});
        res.json({code:200, status:'ok', msg:'User updated successfully.', userObj:userObj})
      }
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS42211", ex));
    }

  }
  async getAllUsers(req,res,next){
    try{
      let users = await this.model_user.GetAll({status:1});
      let repsonse = {code:404, status:false, msg: "Users not found", userObj:[{}]}
      for(let user of users){
       // if(user.facebook_id ==null){
          user.profile_pic =   this.getProfilePicUrl(user)
       // }
          await this.getUserShort(user)
      }  
      if(users){
        repsonse = {code:200,status:'ok',userObj:users};
        
      }
    res.json(repsonse);
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS42205", ex));
    }
  }
  async userMatch(req,res,next){
    try{
      let user_id = req.user.id ;
      let data = req.body;
      let verifyMatch = await this.model_match.Get({user_id:user_id,oponent_id:data.oponentId});
      let both_key = false;
   
      let response;
      if(verifyMatch){ // Update
        console.log("Update")
        let updateData = await this.model_match.Update({is_like:data.isLike},{id:verifyMatch.id});
        response = {code:200,status:'ok',msg:"Data updated successfully .",isBoth:both_key}

      }else{// Create
        console.log("Create")
        let insertObj ={user_id:user_id,oponent_id:data.oponentId,is_like : data.isLike,status:1,created_at:this.knex.raw("CURRENT_TIMESTAMP"),updated_at:this.knex.raw("CURRENT_TIMESTAMP")};
        let insertMatch = await this.model_match.Create(insertObj);
        if(insertMatch){
          response = {code:200,status:'ok',msg:"Data inserted successfully.",isBoth:both_key}
        }

      }
      let isFightExist = await this.model_match.Get({user_id:data.oponentId,oponent_id:user_id,is_like:1});
      console.log("USer Exists",isFightExist)
      let verifyMatchExists = await this.model_match.Get({user_id:user_id,oponent_id:data.oponentId,is_like:1});
     
      if(isFightExist && verifyMatchExists){
        both_key = true;

      }
      response.isBoth = both_key;
     res.json(response);

    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS42205", ex));
    }

  }
  async userShort(req,res,next){
    try{
      let user_id = req.user.id ;
      if(req.body.user_short){
        let updateUser = await this.model_user.Update({user_short:req.body.user_short},{id:user_id});
      }
     let  response = {code:200,status:'ok',msg:"Short inserted successfully."}
    res.json(response);
    }catch(ex){
      console.log(ex);
      next(this.errors.getError("ESS42205", ex));
   }

  }
  async verifyAccessToken(token){
    try{
      let jwtObject = jwt.decode(token);
      return jwtObject.user_id;
    }catch(ex){
      console.log(ex)
      return false;

    }
   

  }

  async getProfile(obj){
    let userObj = await this.model_user.Get(obj);
    delete userObj.password;
    delete userObj.newPasswordTsoken;
    delete userObj.forgetPasswordTimestamp;
    delete userObj.password_token;
   // if(userObj.facebook_id ==null){
    let path = await this.getProfilePicUrl(userObj);
    userObj.profile_pic = path;
   // }
 
    await this.getUserShort(userObj);
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
   getProfilePicUrlX(user){
    try{
      let path = "";
     
      if(user.profile_pic){
        path = process.env.BASE_URL+"upload/"+user.profile_pic;
      }
      user.profile_pic = path;
      return path;;
    }catch(ex){
      console.log("Error in get profile pic",ex);
      user.profile_pic = "";
      return "";
    }
  }

  getProfilePicUrl(user){
    try{
       return user.profile_pic;
    }catch(ex){
      console.log("Error in get profile pic",ex);
      user.profile_pic = "";
      return "";
    }
  }


  async getUserShort(user){
    try{
      let user_short = "";
      if(user.user_short){
        user_short = process.env.BASE_URL+"upload/"+user.user_short;
      }
      user.user_short = user_short;
      return user;;
    }catch(ex){
      console.log("Error in get user short",ex);
      user.user_short = "";
      return "";
    }

  }
}

module.exports = UserController;
