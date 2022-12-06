const Joi = require("joi");
const errors = require("../errors/response-errors");
const debug = require("../libs/debug")('file-upload-handler');
const error = require("../libs/debug")('file-upload-handler:error');
const _ = require("underscore");
let fs = require('fs');
const multer  = require('multer');
const util = require('util');

const stat = util.promisify(fs.stat);
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
            let directory = __dirname + '/../storage/uploads' + dest;
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
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(errors.getError('ESS42207'), false);
            }
            cb(null, true);
        }
    });
    return upload.single(media);
    /*if (_.isString(media)) {
        return upload.single(media);
    } else if (_.isArray(media)) {
        return upload.array(media);
    } else if (_.isObject(media)) {
        return upload.fields(media);
    }*/
};

const doesDirectoryExist = (directory) => {
    try {
        stat(directory).then((stats) => {
            return true;
        }).catch((error) => {
            return false;
        });
    } catch(e) {
        return false;
    }
};

const validations = {
    fileStorageName: Joi.compile({
        fileStorageName: Joi.string().required()
    }),
    destination: Joi.compile({
        destination: Joi.string().required()
    })
};
const uploadUserImage = (media) => {
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
        allowedFile: ['jpg','jpeg','png','gif']
    });
}

module.exports = uploadUserImage;
