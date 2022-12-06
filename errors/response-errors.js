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
        error_message: 'An account already exists for this username. Please login or register with a different username.'
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
        error_code: `ESS42205`,
        error_summary: `Account Not Found`,
        error_message: `Account not found. Please try again.`
    },
    ESS42206: {
        status: 422,
        error_code: `ESS42206`,
        error_summary: `Invalid Credentials`,
        error_message: `Invalid username or password.`
    },
    ESS42207: {
        status: 422,
        error_code: `ESS42207`,
        error_summary: `File Upload Validation Failed`,
        error_message: `Only image files are allowed. Please try again.`
    },
    ESS42208: {
        status: 422,
        error_code: `ESS42208`,
        error_summary: `File Upload Validation Failed`,
        error_message: `Image could not be uploaded. Please try again.`
    },
    ESS42209: {
        status: 422,
        error_code: 'ESS42209',
        error_summary: 'Forgot password not allowed on specified user.',
        error_message: 'Recovery credential not set.'
    },
    ESS42210: {
        status: 422,
        error_code: 'ESS42210',
        error_summary: 'Product Not Found',
        error_message: 'Product not found. Please try again.'
    },
    ESS42211: {
        status: 422,
        error_code: 'ESS42211',
        error_summary: 'Product Not Synced',
        error_message: 'Product description is missing. Please update the product description and try again.'
    },
    ESS42212: {
        status: 422,
        error_code: 'ESS42212',
        error_summary: 'Cart Not Found',
        error_message: 'Cart not found. Please try again.'
    },
    ESS42213: {
        status: 422,
        error_code: 'ESS42213',
        error_summary: 'Invalid Recovery Token',
        error_message: 'Password reset link has expired. Please try again.'
    },
    ESS42214: {
        status: 422,
        error_code: 'ESS42214',
        error_summary: 'Password Reset Failure',
        error_message: 'Failed to reset password. Please try again.'
    },
    ESS42215: {
        status: 422,
        error_code: 'ESS42215',
        error_summary: 'Look Not Found',
        error_message: 'Look not found. Please try again.'
    },
    ESS42216: {
        status: 422,
        error_code: 'ESS42216',
        error_summary: 'Invalid Email Domain',
        error_message: 'The email host (domain) does not exist. Please enter a valid email address and try again.'
    },
    ESS42217: {
        status: 422,
        error_code: `ESS42217`,
        error_summary: `Device Token Registration Failure`,
        error_message: `The device token could not be registered.`
    },
    ESS42401: {
        status: 424,
        error_code: `ESS42401`,
        error_summary: `Unknown Data Exception`,
        error_message: `Something went wrong. Please try again.`
    },
    ESS42901: {
        status: 429,
        error_code: `ESS42901`,
        error_summary: `Too Many Requests`,
        error_message: `You are making too many requests in a configured timeframe. Please spread out your requests.`
    },
    ESS50001: {
        status: 500,
        error_code: 'ESS50001',
        error_summary: 'Internal Server Error',
        error_message: 'There was a problem with the server. Try again later.'
    },
    ESS50301: {
        status: 503,
        error_code: 'ESS50301',
        error_summary: 'Service Unavailable',
        error_message: `We're sorry. The service is temporarily unavailable. Please try again later.`
    },
    ESS50302: {
        status: 503,
        error_code: 'ESS50302',
        error_summary: 'Service Unavailable',
        error_message: `We're sorry. The service is temporarily offline for a scheduled maintenance. Please try us again later.`
    },
    ESS50303: {
        status: 503,
        error_code: 'ESS50303',
        error_summary: 'Service Unavailable',
        error_message: `We're very sorry. We've experienced and unexpected issue and the service is temporarily offline for an unplanned maintenance. We are working hard to get things back online as soon as possible.`
    },
    ESS50304: {
        status: 503,
        error_code: 'ESS50304',
        error_summary: 'Service Unavailable',
        error_message: `There was a problem with the server. Try again later.`
    },
    ESS50305: {
        status: 503,
        error_code: 'ESS50305',
        error_summary: 'API Call to V3 Failed.',
        error_message: 'There was a problem with the server. Try again later.'  // replace this message with message returned from api
    },
    ESS50306: {
        status: 503,
        error_code: 'ESS50306',
        error_summary: 'Data not found.',
        error_message: 'Data is not available.'  // replace this message with message returned from api
    },
    ESS20402: {
        status          : 503, 
        error_code      : 'ESS20402', 
        error_summary   : 'No matching garments found', 
        error_message   : 'No garments found matching this criteria.' 
    },
    ESS20403: {
        status          : 503, 
        error_code      : 'ESS20403', 
        error_summary   : 'Outfit not found', 
        error_message   : 'Outfit not found' 
    },
    ESS20404: {
        status          : 503, 
        error_code      : 'ESS20404', 
        error_summary   : 'Shop item not found', 
        error_message   : 'Shop item detail not found' 
    },
    ESS20405: {
        status          : 503, 
        error_code      : 'ESS20404', 
        error_summary   : 'Categories not found', 
        error_message   : 'Categories not found' 
    },
    ESS20406: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Address Validation Failed`,
        error_message: `Address validation unsuccessful. Please check the address and try again.`
    },
    ESS20407: {
        status: 503,
        error_code: 'ESS50306',
        error_summary: 'Record not found.',
        error_message: 'Sorry! We could not find any results against your search criteria.'  // replace this message with message returned from api
    },
    ESS20408: {
        status: 503,
        error_code: 'ESS50306',
        error_summary: 'Customer not found.',
        error_message: 'Sorry! We could not find customer'  
    },
    ESS20409: {
        status: 503,
        error_code: 'ESS50306',
        error_summary: 'Something went wrong',
        error_message: 'Sorry! Something went wrong please try again'  
    },
    ESS20410: {
        status: 422,
        error_code: `ESS42200`,
        error_summary: `User(s) locked out of Okta`,
        error_message: `Too many login attempts. Please try back in 1 minute.`
    },
    ESS20411: {
        status: 422,
        error_code: `ESS50000`,
        error_summary: `This address already exists`,
        error_message: `This address already exists.`
    },
    ESS20412: {
        status: 204,
        error_code: `ESS20412`,
        error_summary: `Offer Expired`,
        error_message: `Our limited-time SureFit $1 Box Offer is no longer available. Apologies for the inconvenience.`
    },
    ESS20412: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Phone number`,
        error_message: `Sorry! Phone number can not update at this time!Try again.`
    },
    ESS20413: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Error in sending SMS code`,
        error_message: `Please enter a valid phone number`,
        
    },
    ESS20414: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Passcode expire`,
        error_message: `Passcode has been expired`,
        
    },
    ESS20415: {
        status: 422,
        error_code: `ESS42204`,
        error_summary: `User not completed feedback`,
        error_message: `User doesnt complete the feedback`,
        
    },
    ESS204190:{
        status: 422,
        error_code: `ESS204190`,
        error_summary: `Phone number already exists`,
        error_message: `Phone number already exists or invalid! Use different number`,

    },
    ESS204191:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Invalid or expired code. Please try again`,
        error_message: `Invalid or expired code. Please try again`,

    },
    ESS204192:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Invalid response. Please try again`,
        error_message: `Invalid response. Please try again`,

    },
    ESS204193:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Validation missing `,
        error_message: `The must be less than or equal to 0, Enter the valid discount type`,

    },
    ESS204194:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `The discount code already exists`,
        error_message: `The discount code already exists`,

    },
    ESS204195:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `The discount code not found.`,
        error_message: `The discount code not found.`,

    },
    ESS204196:{
        status: 422,
        error_code: `ESS42204`,
        error_summary: `Customer not found on shopify.`,
        error_message: `Customer not found on shopify.`,

    },
    ESS204201:{
        status: 422,
        error_code: `ESS204201`,
        error_summary: `Error in adding event.`,
        error_message: `Error in adding event.`,
    },
    ESS204202: {
        status: 422,
        error_code: `ESS204202`,
        error_summary: `User Email Not Found`,
        error_message: `Email not found. Please try again.`
    },
    ESS204204: {
        status: 422,
        error_code: `ESS204204`,
        error_summary: `Error in fetching events.`,
        error_message: `Error in fetching events.`
    },
    ESS204205: {
        status: 422,
        error_code: `ESS204205`,
        error_summary: `User not found in Okta.`,
        error_message: `Error in fetching User from Okta.`
    },
    ESS204206: {
        status: 422,
        error_code: `ESS204206`,
        error_summary: `Organization not found in Okta.`,
        error_message: `Error in fetching Organization from Okta.`
    },
    ESS204207: {
        status: 422,
        error_code: `ESS204206`,
        error_summary: `Order not found.`,
        error_message: `Error in fetching order .`
    },
    ESS204208: {
        status: 422,
        error_code: `ESS204206`,
        error_summary: `Quiz not found.`,
        error_message: `Error in fetching quiz .`
    },
    ESS204209: {
        status: 422,
        error_code: `ESS204207`,
        error_summary: `Quiz already submitted`,
        error_message: `Quiz already submitted .`
    },
    ESS204219: {
        status: 422,
        error_code: `ESS204207`,
        error_summary: `User is demo model. Permission denied`,
        error_message: `User is demo model. Permission denied.`
    }
};

const getError = (error_code, exception) => {
    let err = customErrors[error_code];
    if (exception){
        err.stack = exception.stack.toString();
    }
    return err;
};

const getOKTAAPIError = (exception) => {
    let err = _.pick(exception, 'status');
    err.error_code = exception.errorCode;
    err.error_summary = exception.errorSummary;
    err.error_message = exception.errorSummary;
    if (exception.errorCauses.length > 0) {
        let parts = exception.errorSummary.split(': ');
        let errorSummary = exception.errorCauses.shift().errorSummary;
        err.error_message = errorSummary.replace(parts[parts.length - 1] + ': ', '');
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
    validationError: validationError,
    getOKTAAPIError: getOKTAAPIError
};
