const express = require('express');
let router = express.Router({ mergeParams: true });
const bodyParser = require('body-parser');
const mysqlCon = require('../../mysql');
const req = require('express/lib/request');

const commentquery = mysqlCon.init();

router.post('/', (req, res) => {
    let insert_query = `insert into comment_table SET ?`;
    let idx = arseInt(req.params.idx);
    req.body.post_idx = idx;
    commentquery.query(insert_query, req.body, (err, result, fleid) => {
        if (err) { console.log(err); return res.sendStatus(400); }
        return res.sendStatus(201);
    })
});

router.post('/reply', (req, res) => {
    let insert_query = `insert into comment_table SET comment_parent_idx = '${req.body.comment_parent_idx}' ?`;
    commentquery.query(insert_query, req.body, (err, result, fleid) => {
        if (err) { console.log(err); return res.sendStatus(400); }
        return res.sendStatus(201);
    })
});

module.exports = router;
