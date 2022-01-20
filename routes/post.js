const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
var MySQLStore = require("express-mysql-session")(session);
const mysqlCon = require('../mysql');
const logger = require('morgan');

const crypto = require('crypto');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const postquery = mysqlCon.init();
mysqlCon.open(postquery);

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
        postquery.query('select idx, title, content, user_id, update_time from board_table where delete_time is null order by idx asc',
            (err, result, field) => {
                if (err) res.status(401);
                res.status(200).send(result);
            });

    } catch (error) {
        res.status(401).send({ error: error.message });
    }
});


router.post('/write', (req, res) => {
    let newWrite = {
        "title": req.body.title,
        "content": req.body.content,
        "user_id": req.body.user_id,  //req.session.id 세션에 저장된 id 갖고오기
        "board_pass": req.body.board_pass
    };

    let board_password = newWrite.board_pass;
    //게시글 입력 쿼리 보내기
    if (req.body.title && req.body.content && req.body.user_id) { //세가지의 값이 존재할 경우
        if (newWrite.board_pass) { //게시글 비밀번호가 있을 경우
            let hashPassword = crypto.createHash("sha256").update(board_password).digest("hex");
            postquery.query(`INSERT INTO board_table SET title = '${newWrite.title}' , content ='${newWrite.content}', user_id ='${newWrite.user_id}', board_pass = '${newWrite.board_pass}'`,
                (err, result) => {
                    if (err) { return res.status(400); }
                    else return res.status(201);
                });
        }
        //게시글 비밀번호가 없을 경우
        postquery.query('INSERT INTO board_table SET ?', newWrite, (err, row) => {
            if (err) { return res.status(400); }
            else return res.status(201);

        });
    } else return res.status(400).send("there_is_blank_info");

});

//게시글 보기
router.get('/:idx', (req, res) => {
    //idx의 번호를 가진 게시글을 보여줌 
    let password = req.body.password;

    postquery.query('select idx, title, content, user_id, board_pass, update_time from board_table where idx = ?', parseInt(req.params.idx), (err, result, field) => {
        if (err) res.status(400).send(err.sqlMessage);
        // 없는 인덱스 페이지를 불러올경우
        if (!result[0]) return res.status(404);
        //패스워드가 있을 경우
        if (result.board_pass) {
            let dbpassword = result[0].board_pass;
            if (password === dbpassword) return res.status(200).send(result[0].idx, result[0].title, result[0].content, result[0].user_id, result[0].update_time);
            else return res.status(401).send("wrong_password");
        }
        return res.status(200).send(result[0].idx, result[0].title, result[0].content, result[0].user_id, result[0].update_time);
    });
});

//수정하기 버튼을 눌렀을 경우
router.put('/:idx', (req, res) => {
    let modifyWrite = {
        "title": req.body.title,
        "content": req.body.content,
        // "user_id": req.body.user_id, //idx
        "board_pass": req.body.board_pass
    };

    if (!req.body.title || !req.body.content || !req.body.user_id) return res.status(400).send("there_is_blank");


    if (req.body.board_pass) {
        let board_password = req.body.board_pass
        let hashPassword = crypto.createHash("sha256").update(board_password).digest("hex");
        //수정한 내용과 시간을 같이 보내줌
        postquery.query('UPDATE board_table SET title = ?, content = ?, board_pass =?  modify_time = current_timestamp() where idx = ?'
            , [modifyWrite.title, modifyWrite.content, modifyWrite.board_pass, parseInt(req.params.idx)], (err, result) => {
                if (err) { console.log(err); return req.status(400); }
                res.status(201);
            })

    }
    //패스워드가 없을 경우
    postquery.query('UPDATE board_table SET title = ?, content = ?, modify_time = current_timestamp() where idx = ?'
        , [modifyWrite.title, modifyWrite.content, parseInt(req.params.idx)], (err, result) => {
            if (err) { console.log(err); return req.status(400); }
            res.status(201).send("success_modify");
        })
});

//삭제
router.delete('/:idx', (req, res) => {
    //삭제시간 넣기
    let idx = parseInt(req.params.idx);
    //인덱스 페이지가 없는경우
    postquery.query('select idx from board_table where idx = ?', idx,
        (err, result) => {
            if (!result[0]) return res.status(404);
            if (result[0]) {
                postquery.query('update board_table SET delete_time = current_timestamp() where idx = ?', idx,
                    (err, result) => {
                        if (err) { return res.status(401); }
                        return res.status(204);
                    });
            }
        });


});


module.exports = router;


// 비밀번호를 입력 해야 하는걸까? 비밀글이라고 체크를?