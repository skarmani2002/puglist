const ValidationMiddleware = require('../helpers/validation-middleware');
const Joi = require("joi");

const validations = {
    login: Joi.compile({
        email       : Joi.string().email().required(),
        password    : Joi.string().required()
      }),
    register: Joi.compile({
        name        : Joi.string().required(),
        email       : Joi.string().email().required(),
        password    : Joi.string().max(50),
        gender      : Joi.string().optional(),
        profile_pic : Joi.string().optional(),
    }),
    facebook_registration: Joi.compile({
        fullName        : Joi.string().required(),
        uid             : Joi.required(),
        photoUrl        : Joi.string().optional(),
        email           : Joi.string().required(),
        token           : Joi.string().optional(),
    }),
    update_password: Joi.compile({
        oldPassword        : Joi.string().required(),
        newPassword        : Joi.string().required(),
    }),
    
    
};

module.exports = (req, res, next) => {
    ValidationMiddleware(req, res, next, validations);
};
