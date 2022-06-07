const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

/* 회원가입 라우터 */
router.post('/join', isNotLoggedIn ,async(req,res,next)=>{ //isNotLoggedIn 미들웨어를 통해 검사
    const { email, nick, password } = req.body;
    try{
        const exUser = await User.findOne({ where: { email:email }});
        if(exUser){ //이미 존재하는 이메일인 경우
            return res.json({
                success: "false",
                errMessage: "이미 존재하는 이메일 입니다.",
            });
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({ email: email, nick: nick, password: hash, });
        return res.json({
            success: true,
            errMessage: null,
        });
    } catch{
        console.error(error);
        return next(error);
    }
})

/* 로그인 라우터 */
router.post('/login', isNotLoggedIn, (req,res,next)=>{
    passport.authenticate('local', (authError, user, info) => { //done이 두번째 인수를 실행한다.
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.json({
                success: "false",
                errMessage: info.message,
            });
            //return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => { //passport.serializeUser 호출
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            res.json({
                success: "true",
                errMessage: null,
            });
            //return res.redirect('/');
        });
    })(req,res,next);
})

/* 로그아웃 라우터 */
router.get('/logout', isLoggedIn, (req,res,next)=>{
    req.logout();
    req.session.destroy();
    res.json({
        success: "true",
        errMessage: null,
    });
})


module.exports = router;