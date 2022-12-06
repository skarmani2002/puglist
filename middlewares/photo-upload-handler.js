const Joi = require("joi");
const errors = require("../errors/response-errors");
const debug = require("../libs/debug")('file-upload-handler');
const error = require("../libs/debug")('file-upload-handler:error');
const _ = require("underscore");
let fs = require('fs');
const multer  = require('multer');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);

const uploadMedia = (media, options) => {
    options.overrideExisting = options.overrideExisting || true;
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let dest = options.destination(req);
            if (!dest) {
                error('destination folder is invalid.');
                return cb(errors.getError('ESS42208'), false);
            }
            let directory = global.constants.LTF_DIR + dest;
            if (fs.existsSync(directory)) {
                cb(null, directory)
            } else {
                debug(`creating dir: ${directory}`);
                mkdir(directory).then(() => {
                    debug(`created dir: ${directory}`);
                    cb(null, directory)
                }).catch((err) => {
                    error(`exception creating dir: ${directory} ${err}`);
                    error('destination folder could not be created.');
                    return cb(errors.getError('ESS42208'), false);
                });
            }
        },
        filename: function (req, file, cb) {
            let fileStorageName = options.name(req);
            if (!fileStorageName) {
                error('file name is invalid.');
                return cb(errors.getError('ESS42208'), false);
            }
            let name = file.originalname.substr(0, file.originalname.lastIndexOf('.'));
            let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
            if (options.overrideExisting) {
                cb(null, (!_.isEmpty(fileStorageName)) ? fileStorageName + ext : file.originalname)
            } else {
                cb(null, (fileStorageName || name) + '-' + (new Date()).getTime() + ext)
            }
        },
        limits: {
            fileSize: 1024 * 1024 * 5
        }
    });
    let upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            //options.allowedFile.join('|')
            // accept image only
            if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
                return cb(errors.getError('ESS42207'), false);
            }
            cb(null, true);
        }
    });
    return upload.single(media);
};

const validations = {
    fileStorageName: Joi.compile({
        fileStorageName: Joi.string().required()
    }),
    destination: Joi.compile({
        destination: Joi.string().required()
    })
};

const uploadUserImage = (media, overrideExisting) => {
    return uploadMedia(media, {
        name: (req) => {
            try {
                let name = req.body.upload_type;
                let valid = Joi.validate({fileStorageName: name}, validations['fileStorageName']);
                if (valid.error) {
		    console.log("uploaderrorv2",valid.error);
                    return false;
                }
       		console.log("namefunc",name);
                return name;
            } catch (e) {
		console.log("uploaderrorv2e",e);
                return false;
            }
        },
        destination: (req) => {
            try {
                let dest = `/users/${req.body.user_id}`;
                let valid = Joi.validate({destination: dest}, validations['destination']);
                if (valid.error) {
 		            return false;
                }
		        return dest;
            } catch (e) {
                return false;
            }
        },
        allowedFile: ['jpg','jpeg'],
        overrideExisting: overrideExisting || true
    },{ mutlerError : (err) =>  {
        if (err instanceof multer.MulterError) {
            console.log("mutlerError", err);
        } else if (err) {
            console.log("otherMutlerError", err);
        }
    }});
};

module.exports = uploadUserImage;

