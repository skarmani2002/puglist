'use strict';
const _ = require('underscore');

class ModelUser {

    constructor() {
        this.table = 'puglist_users';
        this.knex = global.knex;
        }
    async Get(where) {
        let users = await this.knex(this.table).select().where(where);
        return users && users.length > 0 ? users[0] : null;
    }
    async GetAll(where) {
        return await this.knex(this.table).select('id','name','email','gender','profile_pic','latitude','longitude','facebook_id').where(where);
    }
        async Create(data) {
        return await this.knex(this.table).returning('id').insert(data);
    }
    async Update(data, where) {
        return await this.knex(this.table).update(data).where(where);
    }
    async Remove(where) {
        return await this.knex(this.table).where(where).delete();
    }
    
    
    async getUserMophingData(user_id){
        let sql = "SELECT * FROM morph_styles WHERE user_id ="+user_id;
        let response = await this.knex.raw(sql);
        return response[0].length>0?response[0]:null;
    }
    
    
}


module.exports = ModelUser;
