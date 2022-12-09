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
        name        : Joi.string().required(),
        facebook_id : Joi.required(),
        profile_pic : Joi.string().optional(),
        email        : Joi.string().required(),
        access_token: Joi.string().optional(),
    })
    
    
};

module.exports = (req, res, next) => {
    ValidationMiddleware(req, res, next, validations);
};
