const ValidationMiddleware = require('../helpers/validation-middleware');
const Joi = require("joi");

const validations = {
    login: Joi.compile({
        username: Joi.string().required(),
        password: Joi.string().required(),
        relay_state: Joi.string(),
        api_version: Joi.string().optional(),
	platform: Joi.string().optional()
    }),
    register: Joi.compile({
        name: Joi.string().required(),
        email: Joi.string().max(50),
        password: Joi.string().email().required(),
       // gender: Joi.string().valid(['m', 'f']),
    }),
    
    
    
};

module.exports = (req, res, next) => {
    ValidationMiddleware(req, res, next, validations);
};
