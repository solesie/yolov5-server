/*
* 동영상을 등록하는 라우터
*/
const express = require('express');
const path = require('path');
const fs = require('fs');
const execa = require('execa');
const execYolov5 = require('../yolov5/runYolov5.js');
const Media = require('../models/media');

const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.post('/link',isLoggedIn,async(req,res,next)=>{
    const { link } = req.body;
    const category = { short_sleeved_top, long_sleeved_top, short_sleeved_outwear, sling_dress,
        vest, sling, shorts, trousers, skirt, short_sleeved_dress, long_sleeved_dress, vest_dress,
        long_sleeved_outwear } = req.body;
    const execaInfo = await execYolov5(link);
    if(!execaInfo.failed){
        const resultFilesPath = path.join(__dirname,'..','..','yolov5','runs','detect');

        const i = execaInfo.stderr.indexOf("exp",execaInfo.stderr.indexOf("exp")+1);
        const expFileName = execaInfo.stderr.substring(i,execaInfo.stderr.indexOf('/',i));

        const expFilePath = path.join(resultFilesPath,expFileName);//결과 파일의 위치
        
        /**
         * req.user.email, findOne ... -> DB 갱신
         * 디렉토리 값을 json으로 반환한다.
         * 다음 요청부터는 static으로 접근 가능하다(어짜피 실시간 스트리밍 서비스가 아니므로 스트림 이용x)
         */
        let selectedCa = new Array();
        let retUrl = {}; //client는 이 주소로 사진을 요청한다.
        for(let item in category){
            if(category[item]==="true"){
                selectedCa.push(item);
                retUrl[item]=new Array();
            }
        }
        fs.readdirSync(path.join(expFilePath,"ll")).forEach(folder=>{
            //폴더 이름에 선택된 카테고리의 이름이 있는 경우
            selectedCa.some(c=>{
                if(folder.includes(c)){
                    retUrl[c].push(path.join(expFileName,"ll",folder,
                        fs.readdirSync(path.join(expFilePath,"ll",folder))[0] ));
                    return true;
                }
                else
                    return false;
            })
        })
        for(key in retUrl){
            for(value of retUrl[key]){
                try{
                    const media=await Media.create({
                        media: value,
                        UserId: req.user.id,
                    });
                } catch(error){
                    console.error(error);
                    next(error);
                }
            }
        }
        //똑같이 영상도 하나만
        return res.json(retUrl);
    }
    else{
        return res.json({
            success:"false",
            errMessage:execaInfo.stderr,
        });
    }
})
module.exports = router;