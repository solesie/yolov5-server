const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path'); //내장모듈 e.g:path.join()
const session = require('express-session');
const dotenv = require('dotenv'); //.env 사용
const passport = require('passport'); //로그인 패키지
const logger=require('./logger');
const { isLoggedIn, isNotLoggedIn } = require('./routes/middlewares');

dotenv.config();
const authRouter = require('./routes/auth'); //라우팅 분리
const uploadRouter = require('./routes/upload');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig(); //패스포트 설정
app.set('port',process.env.PORT||8001); //포트 설정

/* model server 연결 start */
sequelize.sync({ force: false })
    .then(()=>{
        console.log('데이터베이스 연결 성공');
    })
    .catch((err)=>{
        console.log(err);
    })
/* model server 연결 end */

if(process.env.NODE_ENV==='production'){
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

/* body-parser start */
//동영상, 이미지를 제외한 요청이 req.body에 데이터가 들어간다.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/* body-parser end */
app.use(cookieParser(process.env.COOKIE_SECRET)); //해석된 쿠키들은 req.cookies 객체에 들어간다. 비밀키로 내 서버가 만든 쿠키임을 검증 가능.
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
};
if(process.env.NODE_ENV==='production'){
    sessionOption.proxy = true;
}
app.use(session(sessionOption));
app.use(passport.initialize()); //이 미들웨어는 req에 passport 설정을 심는다.
app.use(passport.session()); //이 미들웨어는 req.session에 passport 정보를 저장한다.

app.use('/auth',authRouter);
app.use('/upload',uploadRouter);
app.use('/media',isLoggedIn, express.static(path.join(__dirname,'..','yolov5',
    'runs','detect')) ); //static은 public에 파일이 없으면 알아서 next 호출한다.

/* error handling middleware start */
app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
    error.status = 404;
    next(error);
});
app.use((err,req,res,next)=>{
    res.status(err.status||500).json({
        success: "false",
        errMessage: err.toString(),
    })
})
/* error handling middleware end */
app.listen(app.get('port'),()=>{
    console.log(app.get('port'), '번 포트에서 대기중');
});