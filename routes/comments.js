const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
var MySQLStore = require("express-mysql-session")(session);
const mysqlCon = require('../mysql');