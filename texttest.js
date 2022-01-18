
const id = /^[a-z0-9_-]{4,20}$/;
const name = /^[가-힣a-zA-Z]+$/;
const phone_num = /\d{3}-\d{3,4}-\d{4}/;
const email = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
///\^[a-zA-Z0-9._]+@[a-zA-Z0-9._].[a-zA-Z0-9]{2,6}/;
const password = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
module.exports = {
    id,
    name,
    phone_num,
    email,
    password
};