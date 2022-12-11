const _ = require("underscore");

const customErrors = {
    ESS40002: {
        status: 400,
        error_code: `ESS40002`,
        error_summary: `The Authorization header is missing.`,
        error_message: `Authorization header is missing in request.`
    },
    ESS40003: {
        status: 400,
        error_code: `ESS40003`,
        error_summary: `Bad Auth Token Format`,
        error_message: `Authorization header is missing in request.`
    },
    ESS40301: {
        status: 403,
        error_code: 'ESS40301',
        error_summary: 'Forbidden',
        error_message: 'Your request is not authorized to access the endpoint.'
    },
    ESS40101: {
        status: 401,
        error_code: `ESS40101`,
        error_summary: `Unauthorized`,
        error_message: `The API cannot authenticate the user for this request.`
    },
    ESS40102: {
        status: 401,
        error_code: `ESS40102`,
        error_summary: `Unauthorized`,
        error_message: `The API cannot authorize the user for this request.`
    },
    ESS40401: {
        status: 404,
        error_code: 'ESS40401',
        error_summary: 'Not Found',
        error_message: 'The requested resource at specified endpoint could not be found.'
    },
    ESS42201: {
        status: 422,
        error_code: 'ESS42201',
        error_summary: 'Field Validation Failed',
        error_message: `Required field validation failed.`
    },
    ESS42202: {
        status: 422,
        error_code: 'ESS42202',
        error_summary: 'Account Already Exists',
        error_message: 'An account already exists for this email. Please login or register with a different emIl.'
    },
    ESS42203: {
        status: 422,
        error_code: `ESS42203`,
        error_summary: `Member Email Not Found`,
        error_message: `Email not found. Please try again or signup.`
    },
    ESS42204: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Account Not Found`,
        error_message: `Account not found. Please try again.`
    },
    ESS42205: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Something went wrong`,
        error_message: `Something went wrong.Please try again.`
    },
    ESS42206: {
        status: 422,
        error_code: `ESS42206`,
        error_summary: `Invalid Credentials`,
        error_message: `Invalid Credentials.`
    },
    ESS42207: {
        status: 422,
        error_code: `ESS42207`,
        error_summary: "Current Password didn`t match!",
        error_message: "Current Password didn`t match!"
    },
    
    
    
   
};

const getError = (error_code, exception) => {
    let err = customErrors[error_code];
    if (exception){
        err.stack = exception.stack.toString();
    }
    return err;
};



const validationError = (joi_errors, next = null) => {
    let err = getError('ESS42201');
    err.error_message = `Required field validation failed for : ${ _.pluck(joi_errors, 'message')[0] || ''}`;
    return err;
};

module.exports = {
    getError: getError,
    validationError: validationError
};
