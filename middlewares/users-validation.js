const Joi = require("joi");
const errors = require("../errors/response-errors");

const validations = {
    login: Joi.compile({
        username: Joi.string().required(),
        password: Joi.string().required(),
        relay_state: Joi.string()
    }),
    register: Joi.compile({
        user: Joi.object().keys({
            username: Joi.string().required(),
            first_name: Joi.string().max(50),
            last_name: Joi.string().max(50),
            email: Joi.string().email().required()
        }).required(),
        credentials: Joi.object().keys({
            password: Joi.object().keys({value: Joi.string().required()})
                    /*recovery_question: Joi.object().keys({
                     question: Joi.string().required(),
                     answer: Joi.string().required(),
                     }).required()*/
        }).required(),
        device_id: Joi.string().allow(null)
    }),
    import_from_v3: Joi.compile({
        user: Joi.object().keys({
            username: Joi.string().required(),
            first_name: Joi.string().max(50),
            last_name: Joi.string().max(50),
            email: Joi.string().email().required()
        }).required(),
        credentials: Joi.object().keys({
            password: Joi.object().keys({value: Joi.string().required()})
                    /*recovery_question: Joi.object().keys({
                     question: Joi.string().required(),
                     answer: Joi.string().required(),
                     }).required()*/
        }).required(),
        device_id: Joi.string().allow(null)
    }),
    import_from_shopify: Joi.compile({
        user: Joi.object().keys({
            username: Joi.string().required(),
            first_name: Joi.string().max(50),
            last_name: Joi.string().max(50),
            email: Joi.string().email().required(),
            shopify_customer_id: Joi.number().required(),
            phone: Joi.string().optional().allow(null)

        }).required(),
        credentials: Joi.object().keys({
            password: Joi.object().keys({value: Joi.string().required()})
                    /*recovery_question: Joi.object().keys({
                     question: Joi.string().required(),
                     answer: Joi.string().required(),
                     }).required()*/
        }).required(),
        device_id: Joi.string().allow(null),


    }),
    update_profile: Joi.compile({
        email: Joi.string().email().required(),
        first_name: Joi.string().max(50),
        last_name: Joi.string().max(50)
    }),
    recover: Joi.compile({
        username: Joi.string().required(),
        type: Joi.string(),
        relay_state: Joi.string()
    }),
    change_password: Joi.compile({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    }),
    create_new_session: Joi.compile({
        device_id: Joi.string().required().length(40)
    }),
    get_contact_info: Joi.compile({
        email: Joi.string().email().required()
    }),
    user_fit_detail: Joi.compile({
        user_id: Joi.number().required(),
        product_id: Joi.number().required()
    }),
    user_sync: Joi.compile({
        user_id: Joi.number(),
        first_name: Joi.string().required().max(50),
        last_name: Joi.string().required().max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        phone_number: Joi.string()
    }),
    product_sync: Joi.compile({
        product_id: Joi.number().required()
    }),
    get_single_fav_product: Joi.compile({
        product_id: Joi.number().required(),
        customer_id: Joi.number().required()
    }),

};

module.exports = (req, res, next) => {
    let rules = Object.keys(validations);
    //check for available route in request
    for (var i = 0; i < rules.length; i++) {
        let rule = rules[i];
        //if a rule for that route is defined
        if (req.path.includes(rule)) {
            var data;
            if (req.method == 'POST') {
                data = req.body;
            }
            if (req.method == 'GET') {
                data = req.params;
            }
            let valid = Joi.validate(data, validations[rule]);
            if (valid.error) {
                debug('Validation Error in %s : ', req.path, rule);
                return next(errors.validationError(valid.error.details));
            } else {
                return next();
            }
        } else {
            if (i === (rules.length - 1)) {
                debug('Validation Rule not found in %s : ', req.path);
                return next(errors.getError('ESS50304'));
            }
        }
    }
};
