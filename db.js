const {Pool} = require('pg');

const connectionString = ''

exports.pool = new Pool({connectionString})