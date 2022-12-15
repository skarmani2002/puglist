const express = require('express');
const router = express.Router();

const AuthManager = require('../auth/AuthManager');
const UserController = require('../controllers/UserController');
const UserValidation = require('../validations/users_validation');
const uploader = require('../middlewares/imageuploader-middleware');

let user_controller                     = new UserController();
let auth_manager                        = new AuthManager();


router.post('/user/login',
   // auth_manager.Authenticate.bind(auth_manager),
    UserValidation,
    user_controller.login.bind(user_controller));


router.post('/user/register',
   uploader.uploadUserImage('profile_pic', {
    customFileName: "profile_pic",
    path: "",
    overideFileName: false
}),
    UserValidation,
    user_controller.register.bind(user_controller));

router.post('/user/facebook_registration',
  //  auth_manager.Authenticate.bind(auth_manager),
    UserValidation,
    user_controller.registerFb.bind(user_controller));
 

router.get('/user/profile',
  auth_manager.Authenticate.bind(auth_manager),
    //UserValidation,
    user_controller.profile.bind(user_controller));

  router.post('/user/update_password',
  auth_manager.Authenticate.bind(auth_manager),
  UserValidation,
  user_controller.updatePassword.bind(user_controller));

  router.post('/user/forgetPassword',
  UserValidation,
  user_controller.forgetPassword.bind(user_controller));

  router.post('/user/veryToken',
  UserValidation,
  user_controller.verifyToken.bind(user_controller));
  
  router.post('/user/resetPassword',
  UserValidation,
  user_controller.resetPassword.bind(user_controller));

  router.post('/user/updateProfile',
  auth_manager.Authenticate.bind(auth_manager),
  UserValidation,
  uploader.uploadUserImage('profile_pic', {
    customFileName: "profile_pic",
    path: "",
    overideFileName: false
  }),
  user_controller.updateProfile.bind(user_controller));

  router.get('/users',
  user_controller.getAllUsers.bind(user_controller));

  router.post('/user/match',
  auth_manager.Authenticate.bind(auth_manager),
  UserValidation,
  user_controller.userMatch.bind(user_controller));




  

 
  
  




module.exports = router;