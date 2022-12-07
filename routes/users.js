const express = require('express');
const router = express.Router();

const AuthManager = require('../auth/AuthManager');
const UserController = require('../controllers/UserController');
const UserValidation = require('../validations/users_validation');
const uploader = require('../middlewares/imageuploader-middleware');

//const uploader = require('../middlewares/imageuploader-middleware');

let user_controller                     = new UserController();
let auth_manager                        = new AuthManager();


router.post('/user/login',
    UserValidation,
    user_controller.login.bind(user_controller));


router.post('/user/register',
   uploader.uploadUserImage('profile_pic', {
    customFileName: "profile_pic",
    path: "/users",
    overideFileName: false
}),
    UserValidation,
    user_controller.register.bind(user_controller));

router.get('/user/profile',
    auth_manager.Authenticate.bind(auth_manager),
    user_controller.profile.bind(user_controller));







module.exports = router;