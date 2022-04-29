// Put your database code here

const Database = require('better-sqlite3')

const db = new Database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name= 'accesslog'`)

let row = stmt.get()

if (row === undefined) {
    console.log('Your database appears to be empty. Creating log database...')
    const sqlInit = ` CREATE TABLE accesslog ( id INTERGER PRIMARY KEY, remoteaddr VARCHAR, remoteuser VARCHAR, time VARCHAR, method VARCHAR, url VARCHAR, protocol VARCHAR, httpversion NUMERIC, status INTEGER, referer VARCHAR, useragent VARCHAR)`

    db.exec(sqlInit)

} else {
    console.log('Log database exists.')
}
module.exports = db