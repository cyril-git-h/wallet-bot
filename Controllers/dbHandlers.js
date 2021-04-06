const {pool} = require('../db');

class dbHandlers {
    async addPrivateKey(userId, privateKey, address) {
        await pool.query(`INSERT INTO eth_keys (user_id, private_key, address) VALUES ($1, $2, $3);`, [userId, privateKey, address])
    }
    async findAddressByID(userId) {
        return await pool.query(`SELECT private_key FROM eth_keys WHERE user_id = $1;`, [userId])
    }
    async deleteRow(address) {
        await pool.query('DELETE FROM eth_keys WHERE address = $1;', [address])
    }
    async getRandomAddress(userId) {
        return await pool.query('SELECT address FROM eth_keys WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1;', [userId])
    }
    async findPrivateKey(address) {
        return await pool.query(`SELECT private_key FROM eth_keys WHERE address = $1;`, [address])
    }
}

exports.dbHandlers = new dbHandlers()