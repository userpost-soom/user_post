const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
var MySQLStore = require("express-mysql-session")(session);
const mysqlCon = require('./mysql');
const logger = require('morgan');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const boardtbcon = mysqlCon.init();
mysqlCon.open(boardtbcon);
// var options = {
//     host: 'localhost',
//     user: 'root',
//     password: 'tnksm1219!',
//     database: 'homepage',
//     port: 3306
// };
// var sessionStore = new MySQLStore(options);
// router.use(
//     session({
//         key: "session_cookie_name",
//         secret: "session_cookie_secret",
//         store: sessionStore,
//         resave: false,
//         saveUninitialized: false,
//     })
// );

//if로그인이 안되어 있으면 res.redirect(./login);
// function loginReq(req, res, next){ //     if(로그인되어){next();}  else(res.redirect('./login');) }

//저장 되어 있는 게시글 불러오기 
router.get('/', (req, res, next) => {
    try { //delete_time이 없는 즉, 삭제되지 않은 게시글 리스트를 보여줌
        boardtbcon.query('select idx, title, content, user_id from board_table where delete_time is null order by idx asc',
            (err, result, field) => {
                if (err) console.log(err);
                //let board_list = result;
                res.status(200).send(result);
            });

    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// router.get('/write', (req, res) => {
//     res.send("글쓰기");
// });

router.post('/write', (req, res) => {
    let newWrite = {
        "title": req.body.title,
        "content": req.body.content,
        "user_id": req.body.user_id,  //req.session.id 세션에 저장된 id 갖고오기
        "board_pass": req.body.board_pass
    };

    //게시글 입력 쿼리 보내기
    if (req.body.title && req.body.content && req.body.user_id) { //세가지의 값이 존재할 경우
        boardtbcon.query('INSERT INTO board_table SET ?', newWrite, (err, row) => {
            if (err) { res.status(400).send(err.sqlMessage) }
            else return res.status(201).send("success_write");

        });
    } else return res.status(400).send("there_is_blank_info");

});

//게시글 보기
router.get('/view/:idx', (req, res) => {
    //idx의 번호를 가진 게시글을 보여줌 
    boardtbcon.query('select idx, title, content, user_id from board_table where idx = ?', parseInt(req.params.idx), (err, result, field) => {
        if (err) res.status(400).send(err.sqlMessage);
        if (!result[0]) return res.status(404).send("wrong_page_idx");
        res.status(200).send(result);
    });
});

//수정하기 버튼을 눌렀을 경우
router.put('/write/:idx', (req, res) => {
    let modifyWrite = {
        "title": req.body.title,
        "content": req.body.content,
        "user_id": req.body.user_id, //idx
        "board_pass": req.body.board_pass
    };
    //수정한 내용과 시간을 같이 보내줌
    if (!req.body.title || !req.body.content || !req.body.user_id) return res.status(400).send("there_is_blank");
    boardtbcon.query('UPDATE board_table SET title = ?, content = ?, modify_time = current_timestamp() where idx = ?'
        , [modifyWrite.title, modifyWrite.content, parseInt(req.params.idx)], (err, result) => {
            if (err) { console.log(err); return req.status(400); }
            res.status(201).send("success_modify");
        })
});

//삭제
router.delete('/view/:idx', (req, res) => {
    //삭제시간 넣기
    let idx = parseInt(req.params.idx);
    boardtbcon.query('update board_table SET delete_time = current_timestamp() where idx = ?', idx,
        (err, result) => {
            if (err) { return res.status(400).send(err.sqlMessage); }
            // res.status(204).redirect('/board');
        });
});


module.exports = router;