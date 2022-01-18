//mysql 모듈화
require('dotenv').config();
const mysql = require('mysql');

const mysqlCon = {
    //연결 객체 생성
    init: function () {
        return mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PW,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
        });
    },
    // 연결
    open: function (con) {
        con.connect(err => {
            if (err) {
                console.log("연결실패", err);
            } else {
                console.log("DBconnect");
            }
        });
    },
    // 연결종료
    close: function (con) {
        con.end(err => {
            if (err) {
                console.log("종료 실패", err);
            } else {
                console.log("종료 성공");
            }
        })
    }
}

// 생성한 객체를 모듈화 하여 외부 파일에서 불러와 사용 할 수 있도록
module.exports = mysqlCon;
