const {Pool} = require('pg');

const connectionString = 'postgres://yfzndlar:JxkF0aeZ-jBVjZlS1kOIEvrNbCiGZfUu@rogue.db.elephantsql.com:5432/yfzndlar'

exports.pool = new Pool({connectionString})