const express = require('express');
const router = express.Router();

//const AuthManager = require('../auth/AuthManager');
const UserController = require('../controllers/UserController');
const UserValidation = require('../validations/users_validation');
const uploader = require('../middlewares/imageuploader-middleware');

//const uploader = require('../middlewares/imageuploader-middleware');

let user_controller                     = new UserController();
//let auth_manager                        = new AuthManager();

router.post('/user/register',
   // auth_manager.Authenticate.bind(auth_manager),
   uploader.uploadUserImage('profile_pic', {
    customFileName: "profile_pic",
    path: "/users",
    overideFileName: true
}),
    UserValidation,
    user_controller.register.bind(user_controller));






module.exports = router;