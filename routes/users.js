const texttest = require("../texttest");

const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');

const session = require('express-session');
var MySQLStore = require("express-mysql-session")(session);

const mysqlCon = require('../mysql');
const memberquery = mysqlCon.init();
mysqlCon.open(memberquery);

const crypto = require('crypto');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


//var sessionStore = new MySQLStore(options);
// router.use(
//     session({
//         key: "session_cookie_name",
//         secret: "session_cookie_secret",
//         store: sessionStore,
//         resave: false,
//         saveUninitialized: false,
//     })
// );
//웹 세션은 사용자가 애플리케이션(즉 웹이나 서버)와 상호 작용하는 동안에만 사용할 수 있도록 임시 데이터를 저장하기 위해 사용하는 데이터 형태


//회원가입 페이지 진입
router.get('/signup', (req, res) => {
    console.log("get성공");
    res.status(200).send("Enter_page");
})

//정보를 입력하고 회원가입 하기 버튼(가상)을 눌렀을 경우
router.post('/signup', (req, res) => {
    let body = req.body;
    let inputPassword = body.password;
    if (!req.body.id || !req.body.name || !req.body.email || !req.body.phone_num) return res.status(400).send("there_is_blank");

    if (!texttest.password.test(inputPassword)) return res.status(401).send("write_other_password");

    //비밀번호 암호화
    let salt = Math.round((new Date().valueOf() * Math.random())) + "";
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

    //입력애햐 하는 필수요소들 중 하나라도 빠졌을 경우
    if (!texttest.id.test(req.body.id)) return res.status(401).send("4_and_20size_write_olny_english_and_num");
    if (!texttest.email.test(req.body.email)) return res.status(401).send("wrong_information_email");
    if (!texttest.phone_num.test(req.body.phone_num)) return res.status(401).send("wrong_information_phone_num");
    //조건을 만족할 경우
    memberquery.query(`INSERT INTO member_table SET id = '${req.body.id}', password = '${hashPassword}', name ='${req.body.name}', email = '${req.body.email}', phone_num = '${req.body.phone_num}', salt = '${salt}';`, (err, row) => {
        if (err) { return res.status(400).send(err.sqlMessage); }
        //id 휴대폰 중복이면 err되도록
        return res.status(201).send("signup_ok");
    })

});


//로그인 정보 
router.post('/login', (req, res) => {
    let id = req.body.id;
    let password = req.body.password;

    memberquery.query('select * from member_table where id = ?', [id], (err, result, fiedls) => {
        if (err) { console.log(err); return res.status(400); }
        //맞는 id가 없으면 다시 입력하기
        if (!result[0]) return res.status(404).send('checkyour_id');

        let user = result[0];
        let dbpassword = user.password;
        let dbsalt = user.salt;
        let hashPassword = crypto.createHash("sha512").update(password + dbsalt).digest("hex");
        if (user.isResign == 'y') return res.status(401).send('checkyour_id');

        //값이 존재할 경우
        if (result.length > 0) {
            if (dbpassword === hashPassword) { // 비밀번호 일치여부 
                req.session.id = user.id;
                req.session.save(() => { return res.status(200).send(user.id + " " + user.name).redirect('/'); })
                //로그인 정보 유지
            }
            else return res.status(400).send('check_password');
        }
        //존재하지 않은경우 return 


    })
});

router.put('/modify', (req, res) => { // 수정하기 
    let id = req.body.id;
    let modify_password = req.body.password;
    //현재 비밀번호가 맞는지 확인은 어떻게 하지?

    if (!texttest.password.test(modify_password)) return res.status(400).send("write_other_password");
    //비밀번호 암호화
    let salt = Math.round((new Date().valueOf() * Math.random())) + "";
    let hashPassword = crypto.createHash("sha512").update(modify_password + salt).digest("hex");

    memberquery.query('UPDATE member_table SET ? modify_time = current_timestamp() where id = ?', [hashPassword, id]
        , (err, result) => {
            if (err) return req.status(400);
            res.status(200).send("success_modify");
        })

});
//로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500);
        //res.redirect("/login");
    })
})

//회원탈퇴
router.delete('/', (req, res) => {
    let idx = req.body.idx;
    memberquery.query('UPDATE member_table set resign_time = current_timestamp(), isResign = "y" where idx = ?', [idx], (err, result, fiedls) => {
        if (err) {
            return res.status(400).send(err);
        }
        return res.redirect("/login");
    }
    )
});


module.exports = router;
