'use strict';
const jwt = require("jsonwebtoken");
let userModel = require('../models/Users');
class AuthManager {

    constructor() {
        // setup up some constants
        this.errors = global.errors;
        this.user_model = new userModel();
    }

    // this only checks the auth, but doesn't block the api call
    async checkAuth (req, res, next) {
        try {
            req.isAuthenticated = await this.CheckAuthentication(req);
        } catch (err) {
            req.isAuthenticated = false;
            
        }
        next();
    };

    async Authenticate(req, res, next) {
        try {
            req.isAuthenticated = await this.CheckAuthentication(req, res, next);
            // if user is authenticated
            if (req.isAuthenticated === true) {
                next();
            } else {
                // if not auth, return 401 Unauthorized
                next(this.errors.getError("ESS40101"));
            }
        } catch (ex) {
            next(this.errors.getError('ESS50001', ex));
        }
    }

    async CheckAuthentication(req, res, next) {

        let isAuthenticated = false;
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if (!token) {
            return next(this.errors.getError("ESS40002"));
        }
        try{
         // check if auth header is valid
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            console.log("RRRR",decoded);
            let verifyUserDb = await  this.user_model.Get({id:decoded.id,email:decoded.email});
            if(verifyUserDb){
                req.user = verifyUserDb;
                isAuthenticated= true;
            }
            
        }catch(ex){
            console.log("Exception authentication",ex)
            isAuthenticated = false;
            return next(this.errors.getError('ESS50001', err));
        }
        return isAuthenticated;
       
    }

}

module.exports = AuthManager;
