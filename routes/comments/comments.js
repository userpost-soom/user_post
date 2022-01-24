const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
var MySQLStore = require("express-mysql-session")(session);
const mysqlCon = require('../../mysql');
const req = require('express/lib/request');

const commentquery = mysqlCon.init();

// function new_commnet() {
//     let insert_query = `insert into comment_table SET = ?`;
// }
router.post('/', (req, res) => {
    let insert_query = `insert into comment_table SET = ?`;

    commentquery.query(insert_query, req.body, (err, result, fleid) => {
        if (err) { console.log(err); return res.sendStatus(400); }
        return res.sendStatus(200);
    })
});

module.exports = router;
