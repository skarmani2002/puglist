const knexConfig = {
    development: {
        client: 'mysql',
//        debug:true,
        connection: {
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'puglist',
	    /*options: {*/
            port:3306
            //}
        },
        migrations: {
            directory: __dirname + '/migrations',
        },
        seeds: {
            directory: __dirname + '/seeds',
        },
    },
   
    production: {
        client: 'mysql',
        connection: {
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'puglist',
	   
	    port:3309,
	    options: {
     		 port:3309 
   	    }
        },
        migrations: {
            directory: __dirname + '/migrations',
        },
        seeds: {
            directory: __dirname + '/seeds',
        },
    }
};

// override the database connection string
if (process.env.DATABASE_URL && process.env.NODE_ENV && {}.hasOwnProperty.call(knexConfig, process.env.NODE_ENV)) {
    knexConfig[process.env.NODE_ENV].connection = process.env.DATABASE_URL;
}

module.exports = knexConfig;
