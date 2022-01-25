//app.js는 모든 파일들의 중심이 되는 파일
// express 프레임워크 구조 내에서 처리 목적으로 사용한다.
const express = require('express');
const app = express();
const userroute = require('./routes/users');
const postroute = require('./routes/post');
const commentroute = require('./routes/comments');
const bodyParser = require('body-parser');
const port = 3000;
const logger = require('morgan');

const router = express.Router({ mergeParams: true });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user', userroute);
app.use('/post', postroute);
app.use('/comment', commentroute);
// 미들웨어가 된 라우터
// 애플리케이션 단계에서 '/' 와 '/users'로 URL을 분리하여 처리
// app.use()는 미들웨어 기능을 마운트하거나 지정된 경로에 마운트하는 데 사용된다. 기본 경로가 일치하면 미들웨어 기능이 실행

app.use(function (req, res, next) { res.status(404); });
app.use(function (err, req, res, next) { console.error(err.stack); res.status(500).send('500 내부적으로 문제가 발생했습니다.'); });

app.listen(port, function () {
    console.log('Example app listening on port : ' + port);
});
