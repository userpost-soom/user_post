const express = require('express');
let router = express.Router({ mergeParams: true });
const bodyParser = require('body-parser');
const mysqlCon = require('../../mysql');
const req = require('express/lib/request');

const commentquery = mysqlCon.init();

let cmt = function (req, res) { }

router.post('/', (req, res) => {
    let insert_query = `insert into comment_table SET ?`;
    // let idx = ㅖarseInt(req.params.idx);
    // req.body.post_idx = idx;
    commentquery.query(insert_query, req.body, (err, result, fleid) => {
        if (err) { console.log(err); return res.sendStatus(400); }
        return res.sendStatus(201);
    })
});

//대댓글을 위한 쿼리
router.post('/:comment_idx', (req, res) => {
    let comment_idx = ParseInt(req.params.idx);
    let insert_query = `insert into comment_table SET post_idx = ?, content = ?, user_id = ?, comment_parent_idx = ?`;
    commentquery.query(insert_query, [req.body, comment_idx], (err, result, fleid) => {
        if (err) { console.log(err); return res.sendStatus(400); }
        return res.sendStatus(201);
    })
});

module.exports = router;
