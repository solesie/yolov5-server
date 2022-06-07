const path = require('path');
const fs = require('fs');
const execa = require('execa');
async function execYolov5(link){
    const detectPath = path.join(__dirname,'..','..','yolov5','detect.py');
    const bestPath = path.join(__dirname,'..','..','yolov5','best.pt');
    const execaInfo=await execa("python3",
        [detectPath,"--weights",bestPath,"--source",link]);
    await execa("rm",["-r","-f","./PERSON"]);
    return execaInfo;
}
module.exports = execYolov5;