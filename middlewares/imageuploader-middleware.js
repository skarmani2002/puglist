/**
 * Created by Suresh Kumar on 2022.
 */
const _ = require("underscore");
const directoryExists = require('directory-exists');
const mkdirp = require('mkdirp');

let fs = require('fs');
const multer = require('multer');
const util = require('util');
 const uploadPath = __dirname + "/../upload/";
const Joi = require("joi");
const mkdir = util.promisify(fs.mkdir);
const errors = require("../errors/response-errors");
const uploadMedia = (media, option) => {

    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            option.destination(req, (data) => {
                let destinationPath = uploadPath + data;
                //console.log("Destination path", destinationPath);
              
                if (!directoryExists.sync(destinationPath)) {

                    /*mkdirp(destinationPath, (error) => {
                        //console.log("Desiutnation", error);
                        if (error) {
                            cb({
                                status: 422,
                                error_code: `ESS42204`,
                                title: `File Upload Validation Failed`,
                                detail: error
                            }, false);
                        }

                        cb(null, destinationPath);
                    })*/
            if (fs.existsSync(destinationPath)) {
                cb(null, destinationPath)
            } else {
                mkdir(destinationPath).then(() => {
                    cb(null, destinationPath)
                }).catch((err) => {
                    console.log(`exception creating dir: ${destinationPath} ${err}`);
                    console.log('destination folder could not be created.');
                    return cb(errors.getError('ESS42208'), false);
                });
            }

                } else
                    cb(null, destinationPath);
            })

        },
        filename: (req, file, cb) => {

            let overridefilename = option.overideFileName(req) || false;

            let fileStorageName = option.fileName(req) ? option.fileName(req) : req.originalname;

            let name = file.originalname.substr(0, file.originalname.lastIndexOf('.'));
            let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));

            if (overridefilename) {
                req.body.profile_pic = fileStorageName + ext 
                cb(null, (!_.isEmpty(fileStorageName)) ? fileStorageName + ext : file.originalname)
            } else {
                cb(null, (fileStorageName || name) + '-' + (new Date()).getTime() + ext)
            }

        }
    });

    let upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            let errosobj = {
                status: 422,
                error_code: `ESS42204`,
                title: `File Upload Validation Failed`,
                detail: `file upload: Only image files are allowed.`
            };
            // accept image only
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(errors.getError('ESS42207'), false);
            }

            cb(null, true);
        }
    });

    return upload.single(media);
};






const getUserPath = (req, cb) => {
    cb(req.body.user_id);
};





const validations = {
    fileStorageName: Joi.compile({
        fileStorageName: Joi.string().required()
    }),
    destination: Joi.compile({
        destination: Joi.string().required()
    })
};

const uploadUserImage = (upFileName, upconfig) => {
    return uploadMedia(upFileName, {
        fileName: (req) => {
            return `${upconfig.customFileName}`+Date.now()
        },
        destination: (req, cb) => {
                cb(`${upconfig.path}`);
          
        },
        overideFileName: (req) => {
            return `${upconfig.overideFileName}`;
        }
    });
};



const uploadMediaImage = (upFileName, upconfig) => {

    return uploadMedia(upFileName, {
        fileName: (req) => {
            try {
                let type = req.body.type;
                req.mediaName = type + "image" + Date.now();
                return req.mediaName;
            } catch (e) {
                console.log("Error", e);
                return false;
            }
        },
        destination: (req, cb) => {
            try {
                let type = req.body.type;
                upconfig.path = '/media/' + type;
                cb(`${upconfig.path}`);
            } catch (e) {
                console.log("Error1", e);
                return false;
            }
        },
        overideFileName: (req) => {
            try {
                return `${upconfig.overideFileName}`;
            } catch (e) {
                console.log("Error2", e);
                return false;
            }
        },
        allowedFile: ['jpg', 'jpeg', 'png', 'gif']
    });
};

const uploadReviewImages = (upFileName, upconfig) => {

    return uploadArrayMedia(upFileName, {
        fileName: (req) => {
            try {
                req.mediaName = "image" + Date.now();
                return req.mediaName;
            } catch (e) {
                console.log("Error", e);
                return false;
            }
        },
        destination: (req, cb) => {
            try {
                upconfig.path = '/media/review';
                cb(`${upconfig.path}`);
            } catch (e) {
                console.log("Error1", e);
                return false;
            }
        },
        overideFileName: (req) => {
            try {
                return `${upconfig.overideFileName}`;
            } catch (e) {
                console.log("Error2", e);
                return false;
            }
        },
        allowedFile: ['jpg', 'jpeg', 'png', 'gif']
    });
};



module.exports = {
    uploadUserImage: uploadUserImage,
    uploadMediaImage: uploadMediaImage,
    uploadReviewImages: uploadReviewImages,
};
