'use strict';
const Joi = require("joi");
const debug = require("../libs/debug")('file-upload-handler');
const error = require("../libs/debug")('file-upload-handler:error');
const uploadMedia = require("../libs/file_upload");
const _ = require("underscore");

const validations = {
    fileStorageName: Joi.compile({
        fileStorageName: Joi.string().required()
    }),
    destination: Joi.compile({
        destination: Joi.string().required()
    })
};


/*
*
* ---------------- Usage Example ------------------
* For single file => uploadUserImages('field_name')
* For indexed array of files => uploadUserImages({name: 'field_name', maxCount: 12})
* For key/value array of files => uploadUserImages([{name: 'avatar', maxCount: 1}, { name: 'gallery', maxCount: 8}])
*
* */
const uploadUserImages = (media) => {
    return uploadMedia(media, {
        name: (req) => {
            try {
                let name = req.body.upload_type;
                let valid = Joi.validate({fileStorageName: name}, validations['fileStorageName']);
                if (valid.error) {
                    return false;
                }
                return name;
            } catch (e) {
                return false;
            }
        },
        destination: (req) => {
            try {
                let dest = `/ltf/users/${req.body.user_id}`;
                let valid = Joi.validate({destination: dest}, validations['destination']);
                if (valid.error) {
                    return false;
                }
                return dest;
            } catch (e) {
                return false;
            }
        },
        allowedFile: ['png']
    });
};


module.exports = {
    uploadUserImages
};
