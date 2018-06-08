// on 8x8, list of keyboard matching buttons list
var keyList = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,
    49,50,51,52,53,54,55,56,57,48,32,
    96,97,98,99,100,101,102,103,104,105,
    111,106,109,107,110,
    189,187,8,219,221,220,186,222,188,190,191,192,16];
var mobile = false;                         //mobile status identifier
var IE = false;
var velocity;                               //color number
var opacity = ",1)";                        //opacity postfix
var select, songs, LEDList;                 //selected song, song list, song's LED list
var keyColor = [];                          //button velocity
var pressedKey = [];                        //pressing status idf
var coloredKey = [];                        //button LED Color
var keyCount = [];                          //number of same button's sample
var counter = [];                           //press counter
var baseColor = "#FFFFFF";                  //base Color, dark gray
var strokeColor = "rgba(255,255,255,0.9)";  //outer of button color, light gray
var sound = [];                             //sample's url
var audio = [];                             //audio obj
var audioInstance = [];                     //arr for control audio obj
var autoData = [];                          //auto process data
var cirs = [];                              //page button position
var cirs2 = [];                             //page button obj
var rects = [];                             //button obj
var drect = [];
var dcir = [];
var bg;
var nowPage = 0;
var chain = 6;                              //Number of pages
var keyX = 8, keyY = 8;                     //Number of button
var timer;                                  //var for dynamic canvas size
var autoP = false;                          //auto process status
var stage;                                  //var for easelJS canvas control
var st;                                     //setTimer var
var keyTest = [];                           //for LEDList Test
var recData = [];
var glowChk = true;
var sessChk = false;
var cTimer;
var sIdx = 0;

// For Input:File Change listener
$(document).ready(function(){
    var fileTarget = $('.upload-hidden');

    fileTarget.on('change', function(){
        if(window.FileReader){
            var filename = $(this)[0].files[0].name;
        } else {
            var filename = $(this).val().split('/').pop().split('\\').pop();
        }

        $(this).siblings('.upload-name').val(filename);
    });
}); 

function sessAtv(){
    if(!window.sessionStorage) {
        alert("SessionStorage doesn't supported");
        return;
    }
    else if(autoP){
        alert("Cannot use during AutoPlay");
    }
    else{
        if(!sessChk){
            recData.length = 0;
            sessionStorage.clear();
            sIdx = 0;
            sessionStorage.setItem(sIdx++, "c "+(nowPage+1));
            cTimer = new Date().getTime();
        }
        else{
            var now = new Date().getTime();
            sessionStorage.setItem(sIdx++, "d "+(now-cTimer));
            for(var i = 0 ; i < sIdx ; i++)
                recData.push(sessionStorage.getItem(i));
        }
        sessChk = !sessChk
        this.classList.toggle("on");
    }
}

function H2U(){
    var targets = document.getElementsByClassName("tut");

    targets[0].style.display = "block";
    targets[0].style.left = document.getElementsByClassName('upload-name')[0].getBoundingClientRect().left - targets[0].width*0.05 + "px";
    targets[0].style.top = document.getElementsByClassName('upload-name')[0].getBoundingClientRect().top - targets[0].height + "px";

    setTimeout(() => {
        targets[0].style.display = "none";
        targets[1].style.display = "block";
        targets[1].style.left = document.getElementById("fsBtn").getBoundingClientRect().left - targets[1].width*0.1 + "px";
        targets[1].style.top = document.getElementById("fsBtn").getBoundingClientRect().top - targets[1].height + "px";
    }, 1500);

    setTimeout(() => {
        targets[1].style.display = "none";
        targets[2].style.display = "block";
        targets[2].style.left = document.getElementById("atBtn").getBoundingClientRect().left -targets[2].width*0.25 + "px";
        targets[2].style.top = document.getElementById("atBtn").getBoundingClientRect().top - targets[2].height + "px";
    }, 3000);

    setTimeout(() => {
        targets[2].style.display = "none";
        targets[3].style.display = "block";
        targets[3].style.left = document.getElementById("sess").getBoundingClientRect().left + "px";
        targets[3].style.top = document.getElementById("sess").getBoundingClientRect().top - targets[3].height + "px";
    }, 4500);

    setTimeout(() => {
        targets[3].style.display = "none";
        targets[4].style.display = "block";
        targets[4].style.left = document.getElementById("glowBtn").getBoundingClientRect().left - targets[4].width/2 + "px";
        targets[4].style.top = document.getElementById("glowBtn").getBoundingClientRect().top - targets[4].height + "px";
    }, 6000);

    setTimeout(() => {
        targets[4].style.display = "none";
        targets[5].style.display = "block";
        targets[5].style.left = document.getElementById("Velocity").getBoundingClientRect().left + "px";
        targets[5].style.top = document.getElementById("Velocity").getBoundingClientRect().top - targets[5].height + "px";
    }, 7500);

    setTimeout(() => {
        [].forEach.call(targets, (item) => {
            item.style.display = "none";
        });
    }, 9000);
}

//Script for Array Initialization
if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value: function(value) {
            // Steps 1-2.
            if (this == null) {
            throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            // Steps 3-5.
            var len = O.length >>> 0;
            // Steps 6-7.
            var start = arguments[1];
            var relativeStart = start >> 0;
            // Step 8.
            var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);
            // Steps 9-10.
            var end = arguments[2];
            var relativeEnd = end === undefined ?
            len : end >> 0;
            // Step 11.
            var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);
            // Step 12.
            while (k < final) {
            O[k] = value;
            k++;
            }
            // Step 13.
            return O;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var filter = "win16|win32|win64|mac";
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    // on mobile env, for support multi touch, identify device status
    if(navigator.platform){
        if(0 > filter.indexOf(navigator.platform.toLowerCase())){
            //alert("Mobile");
            mobile = true;
            document.getElementById("Env").innerText = "Mobile";
            document.getElementById("glowBtn").classList.toggle("on");
        }
        else{
            //alert("PC");
            mobile = false;
            document.getElementById("Env").innerText = "PC";
            if(!isIE && !isEdge){
                IE = false;
            }
            else{
                IE = true;
                if(isIE)
                    alert("Audio almost not working well on IE...\nplease use other browser T^T\nSorry")
            }
        }
    }

    // get Velocity
    velocity = getVel().split('\n');
    keyColor.length=0;
    for(var pp = 0 ; pp < velocity.length; pp++){
        velocity[pp] = velocity[pp].replace(/\./gi,',');
        keyColor[pp] = "rgba("+velocity[pp]+opacity;
    }
    document.getElementById("Velocity").classList.toggle("on");

    // initialize all arrays
    arrinit();

    cnv2Resize();
    window.addEventListener('resize',function(){
        clearTimeout(timer);
        timer = setTimeout(cnv2Resize, 300);
    }, false);

    document.getElementById('zipUp').addEventListener('change',function(){
        setProjectFile();
    });
    document.getElementById('fsBtn').addEventListener('click', function(){
        setFile();
    });
    document.getElementById('atBtn').addEventListener('click', function(){
        auto();
    });
    document.getElementById('stBtn').addEventListener('click', function(){
        stopT();
    });
    document.getElementById('recSave').addEventListener('click', function(){
        recSave();
    });
    document.getElementById('recPlay').addEventListener('click', function(){
        recAuto();
    });
    document.getElementById('tutorial').addEventListener('click', function(){
        H2U();
    });
    
    var glowBtn = document.getElementById('glowBtn');
    glowBtn.onclick = function() {
        glowChk = !glowChk;
        glowBtn.classList.toggle("on");
        for(var i = 0 ; i < keyX*keyY ; i++){
            if(pressedKey[i] == 1){
                if(!glowChk)
                    rspace[i].style.boxShadow = "";
                else
                    rspace[i].style.boxShadow = "0px 0px 32px 1px "+coloredKey[i];
            }
        }
    };
    document.getElementById("sess").onclick = sessAtv;
});

function cssSet(){
    var siz = window.innerWidth > window.innerHeight ? window.innerHeight*19/20 : window.innerWidth*19/20;
    var cornerRad = siz/(keyX*keyY);

    bg = document.getElementById("backtest");
    bg.style.borderRadius = cornerRad+"px";
    bg.style.margin="auto";
    bg.style.width = "95%";
    bg.style.height = (window.innerHeight*17/20).toString()+"px";
    bg.style.backgroundColor = "#444444";

    while(bg.firstChild && bg.hasChildNodes)
        bg.removeChild(bg.firstChild);

    fg = document.getElementById("fg");
    fg.style.display = "block";
    fg.style.position = "absolute";
    fg.style.zIndex = "1";
    fg.style.margin = "auto";
    fg.style.width = bg.style.width;
    fg.style.height = bg.style.height;
    fg.style.backgroundColor = "rgba(0,0,0,0)";
    if(mobile){
        fg.removeEventListener('touchstart', Touched, false);
        fg.addEventListener('touchstart', Touched, false);
    }
    else{
        fg.removeEventListener("click", Clicked);
        fg.addEventListener("click", Clicked);
    }

    rspace = [];

    for(var i = 0 ; i < (keyX*keyY); i++){
        rects[i] = {x: (window.innerWidth/2-(keyX/2)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (bg.offsetHeight/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
        rspace[i] = document.createElement("span");
        rspace[i].setAttribute('class','btnClass')
        rspace[i].style.position = "absolute"
        rspace[i].style.left = rects[i].x+cornerRad/2+"px";
        rspace[i].style.top = rects[i].y+cornerRad/2+"px";
        rspace[i].style.width = rects[i].w-cornerRad+"px";
        rspace[i].style.height = rects[i].h-cornerRad+"px";
        rspace[i].style.backgroundColor = strokeColor;
        rspace[i].style.borderRadius = cornerRad/2+"px";
        rspace[i].style.borderWidth = cornerRad/2+"px";
        rspace[i].style.borderColor = "rgba(0,0,0,0.25)";
        
        rspace[i].style.boxShadow = "";
        bg.appendChild(rspace[i]);
    }

    cspace = [];

    for(var i = 0 ; i < chain; i++){
        cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
        cspace[i] = document.createElement("span");
        cspace[i].setAttribute('class','btnClass')
        cspace[i].style.position = "absolute"
        cspace[i].style.zIndex = "1";
        cspace[i].style.left = cirs[i].x+cornerRad/2+"px";
        cspace[i].style.top = cirs[i].y+cornerRad/2+"px";
        cspace[i].style.width = cirs[i].w-cornerRad/2+"px";
        cspace[i].style.height = cirs[i].h-cornerRad/2+"px";
        cspace[i].style.backgroundColor = strokeColor;
        cspace[i].style.borderRadius = "50%";
        cspace[i].style.borderWidth = cornerRad/3+"px";
        if(nowPage == i){
            cspace[i].style.borderColor = "cyan";
            cspace[i].style.boxShadow = "0px 0px 32px 1px cyan";
        }
        else{
            cspace[i].style.borderColor = "rgba(0,0,0,0.5)";
            cspace[i].style.boxShadow = "";
        }
        cspace[i].setAttribute('onclick', 'cssClick2('+i+');');
        bg.appendChild(cspace[i]);
    }
}

// function cssClick(kNumb){
//     if(audio[nowPage][kNumb][counter[nowPage][kNumb]])
//     {
//         if(keyTest[nowPage][kNumb].length > 0)
//             keyLED1(nowPage, kNumb, counter[nowPage][kNumb], 0);
//         playAudio(nowPage,kNumb);
//     }
// }

function cssClick2(kNumb){
    cspace[nowPage].style.borderColor = "rgba(0,0,0,0.5)";
    cspace[nowPage].style.boxShadow = "";
    nowPage = kNumb;
    if(sessChk){
        sessionStorage.setItem(sIdx++, "c "+(nowPage+1));
    }
    cspace[nowPage].style.borderColor = "cyan";
    cspace[nowPage].style.boxShadow = "0px 0px 32px 1px cyan";
}

// if browser size change, dynamically set size to fit browsers'
function cnv2Resize() {
    cssSet();
}

// button click/touch offset checker
function collides(x, y) {
    var isCollision = false;
    for (var i = 0, len = rects.length; i < len; i++) {
        var left = rects[i].x, right = left+rects[i].w;
        var top = rects[i].y, bottom = rects[i].y+rects[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = true;
            if(audio[nowPage][i][counter[nowPage][i]])
            {
                if(keyTest[nowPage][i].length > 0)
                    keyLED1(nowPage, i, counter[nowPage][i], 0);
                playAudio(nowPage,i);
            }
            else return null;
        }
    }
    return isCollision;
}

// page button's
function collides2(x, y) {
    var isCollision = false;
    for (var i = 0, len = cirs.length; i < len; i++) {
        var left = cirs[i].x-window.innerWidth, right = left+cirs[i].w;
        var top = cirs[i].y, bottom = cirs[i].y+cirs[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = cirs[i];
            cssClick2(i);
        }
    }
    return isCollision;
}

// keyDown/Up listener
var keysDown = {};
window.addEventListener('keydown', function(e) {
    keysDown[e.keyCode] = true;
});
window.addEventListener('keyup', function(e) {
    delete keysDown[e.keyCode];
});

// Mobile Touch process, allow multi touches
function Touched(ev){
    var touch;
    touch = ev.touches;
    for(ii = 0 ; ii < touch.length; ii++)
        collides(touch[ii].pageX, touch[ii].pageY);
}

// PC Click process
function Clicked(e) {
    collides(e.offsetX, e.offsetY);
}

// PC Button Keyboard Input Listener
window.addEventListener("keydown", function(e) {
    if(keyList.indexOf(e.keyCode) > -1) {
        if(audio[nowPage][keyList.indexOf(e.keyCode)][counter[nowPage][keyList.indexOf(e.keyCode)]])
        {
            var keyNum = keyList.indexOf(e.keyCode);
            if(keyTest[nowPage][keyNum].length > 0)
                keyLED1(nowPage, keyNum, counter[nowPage][keyNum], 0);
            playAudio(nowPage, keyNum);
        }
        e.preventDefault();
    }
}, false);

// Audio Play Process
function playAudio(page, key) {
    if(audio[page][key][counter[page][key]])
    {
        if(sessChk){
            var now = new Date().getTime();
            if(now-cTimer > 1)
                sessionStorage.setItem(sIdx++, "d "+parseInt(now-cTimer));
            sessionStorage.setItem(sIdx++, "o "+parseInt((key/8)+1)+" "+((key%8)+1));
            cTimer = now;
        }
        sound[page][key][counter[page][key]].currentTime = 0;
        sound[page][key][counter[page][key]].play();
        counter[page][key] = (counter[page][key]+1)%keyCount[page][key];
    }
}

// Set all Text Loading
function LoadingStatus(){
    document.getElementById("Info").className="info";
    document.getElementById("KeySound").className="info";
    document.getElementById("LEDList").className="info";
    document.getElementById("AutoData").className="info";
}

function setInfo(content){
    for(var i = 0 ; i < content.length ; i++)
    {
        var str = content[i].split('=');
        if(str[0] == "chain")
            chain = parseInt(str[1]);
        if(str[0] == "buttonX")
            keyX = parseInt(str[1]);
        if(str[0] == "buttonY")
            keyY = parseInt(str[1]);
    }
    arrinit();
    cssSet();
    document.getElementById("Info").classList.toggle("on");
    //console.log(chain, keyX, keyY);
}

var sList = [];
var lstring = [];
var ablob = [];
var dirs = [];

function handleFile(f){
    var title = f.name;
    var dateBefore = new Date();
    JSZip.loadAsync(f)
    .then(function(zip){
        var dateAfter = new Date();
        zip.forEach(function(relativePath, zipEntry){
            if(zipEntry.name.toLowerCase() == "info"){
                zipEntry.async("string")
                .then(function(content){
                    setInfo(content.split('\n'));
                });
            } else if(zipEntry.name.toLowerCase() == "autoplay"){
                zipEntry.async("string")
                .then(function(content){
                    autoData = content.split('\n');
                    document.getElementById("AutoData").classList.toggle("on");
                });
            } else if(zipEntry.name.toLowerCase() == "keysound"){
                zipEntry.async("string")
                .then(function(content){
                    sList = content.split('\n');
                });
            }
            if(zipEntry.dir == true){
                dirs.push(relativePath.replace(/\//gi, ''));
            }
        });
        for(var i = 0 ; i < dirs.length; i++){
            if(dirs[i].toLowerCase() == "sounds")
                zip.folder(dirs[i]).forEach(function(relativePath, zipEntry){
                    zip.file(zipEntry.name).async("blob")
                    .then(function(blob){
                        ablob[0].push(relativePath);
                        ablob[1].push(URL.createObjectURL(blob));
                    });
                });
            else if(dirs[i].toLowerCase() == "keyled")
                zip.folder(dirs[i]).forEach(function(relativePath, zipEntry){
                    zip.file(zipEntry.name).async("string")
                    .then(function(content){
                        if(relativePath.split('.').length == 1){
                            lstring[0].push(relativePath);
                            lstring[1].push(content);
                        }
                    });
                });
        }
    });
}

function setKeyZip(content){
    document.getElementById("KeySound").className = "info";
    document.getElementById("KeyCnt").className = "info";
    document.getElementById("KeyCnt").innerHTML = "000/000";
    var sampleCnt = 0;
    var ssss = sList.length;
    for(var i = 0 ; i < chain ; i++)
        for(var j = 0 ; j < keyX*keyY ; j++){
            audio[i][j].length = 0;
            sound[i][j].length = 0;
            keyCount[i][j] = 0;
        }
    for(var i=0; i < content.length; i++)
    {
        var str = content[i].split(' ');
        if(str.length == 4)
        {
            var page = parseInt(str[0])-1;
            var num = ((parseInt(str[1])-1)*keyY)+(parseInt(str[2])-1);
            var stmp = ablob[0].indexOf(str[3].replace(/\r/gi,""));
            if( stmp >-1 ){
                var scnt = keyCount[page][num];
                audio[page][num][scnt] = ablob[0][stmp];
                sound[page][num].push(new Audio(ablob[1][stmp]));
                sound[page][num][scnt].oncanplay = () => {
                    sampleCnt++;
                    //console.log(sampleCnt);
                    if(sampleCnt <= ssss)
                        document.getElementById("KeyCnt").innerHTML = sampleCnt+"/"+ssss;
                    if(sampleCnt == ssss){
                        document.getElementById("KeyCnt").className = "info on";
                        //document.getElementById("KeySound").classList.toggle("on");
                        document.getElementById("KeySound").className = "info on";
                    }
                };
                keyCount[page][num]++;
            }
        }
        else if(str.length < 2)
            --ssss;
    }
    //document.getElementById("KeySound").classList.toggle("on");
}

function setLEDZip(content){
    document.getElementById("LEDList").className = "info";
    for(var p = 0 ; p < content[0].length; p++)
    {
        var tmp = content[0][p].split(' ');
        var ltmp = content[1][p].split('\n')
        var pNum = parseInt(tmp[0])-1;
        var keyNum = (parseInt(tmp[1])-1)*keyX+(parseInt(tmp[2])-1);
        keyTest[pNum][keyNum].push(ltmp);
        var keyCnt = keyTest[pNum][keyNum].length-1;
        for(ir=0; ir<parseInt(tmp[3])-1; ir++){
            keyTest[pNum][keyNum][keyCnt] = keyTest[pNum][keyNum][keyCnt].concat(ltmp);
        }
    }
    document.getElementById("LEDList").className = "info on";
}

// set project
function setProjectFile() {
    document.getElementById("KeySound").className = "info";
    document.getElementById("KeyCnt").className = "info";
    document.getElementById("KeyCnt").innerHTML = "000/000";
    
    sessionStorage.clear();
    stopT();    // if autoplay process turned on, then off
    nowPage = 0;
    LoadingStatus();    // set all message to loading

    autoData.length=0;
    keyColor.length=0;
    for(var pp = 0 ; pp < velocity.length; pp++){
        velocity[pp] = velocity[pp].replace(/\./gi,',');
        keyColor[pp] = "rgba("+velocity[pp]+opacity;
    }

    var files = document.getElementById("zipUp");

    for(var i = 0 ; i < files.files.length; i++)
        handleFile(files.files[i]);

    cssSet();
}

function setFile() {
    setKeyZip(sList);
    setLEDZip(lstring);
}

function auto() {
    stopT();
    autoP = true;
    autoProcess(autoData, 0);
}

function recAuto(){
    stopT();
    autoP = true;
    autoProcess(recData, 0);
}

function recSave(){
    if(recData.length > 1){
        var tmpTxt = "";
        for(var i = 0 ; i < recData.length; i++){
            tmpTxt += recData[i]+"\n";
        }
        var t = document.createElement("textarea");
        document.body.appendChild(t);
        t.value = tmpTxt;
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        alert("Copied!");
    }
}

// autoPlay Process
function autoProcess(adt, tt) {
    var dur = 0;
    if(tt < adt.length && adt.length > 0 && autoP)
    {
        //get data & split
        var temp = adt[tt].split(' ');
        var tCase = temp[0].toLowerCase();
        //if need change page
        if(tCase == 'c' || tCase == "chain")
            cssClick2(parseInt(temp[1])-1);
        //if need duration to autoplay
        else if(tCase == 'd' || tCase == 'delay')
            dur += parseInt(temp[1]);
        //LED On
        else if(tCase == 'o' || tCase == 'on')
        {
            var keyNum = (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1);
            if(keyTest[nowPage][keyNum].length > 0)
                keyLED1(nowPage, keyNum, counter[nowPage][keyNum], 0);
            playAudio(nowPage, keyNum);
        }
        // LED Off... but doesn't need
        // else if(tCase == 'f' || tCase == 'off')
        // {
        //     var keyNum = (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1);
        //     if(keyTest[nowPage][keyNum].length > 0)
        //         keyLED2(nowPage, keyNum, counter[nowPage][keyNum], 0);
        // }

        //Recursively Turn on/off LED
        dur--;
        if(dur < 0)
            dur = 0;
        if(dur >= 1)
            setTimeout(autoProcess,dur,adt,++tt);
        else
            autoProcess(adt, ++tt);
    }
    else
        stopT();
}

//LED ON(without color)
function onLED(page, key) {
    pressedKey[key] = 1;
    coloredKey[key] = keyColor[120];
}

//LED ON(with color)
function onLED2(page, key, color)
{
    pressedKey[key] = 1;
    if(parseInt(color) < keyColor.length)
        coloredKey[key] = keyColor[parseInt(color)];
    else    //if color is out of velocity, change color code to RGB
        coloredKey[key] = s2c(color);

    rspace[key].style.borderColor = coloredKey[key];
    if(glowChk && !mobile && !IE)
        rspace[key].style.boxShadow = "0px 0px 32px 1px "+coloredKey[key];

}

//LED OFF
function offLED(page, key) {
    pressedKey[key] = 0;

    rspace[key].style.borderColor = "rgba(0,0,0,0.25)";
    rspace[key].style.boxShadow = "";
}

//LED set Process
function keyLED1(page, key, cnt, tt) {
    var dur=0;

    var temp = keyTest[page][key][cnt];
    //if there isn't LEDSET
    if(typeof temp == 'undefined')
        cnt = 0;
    
    temp = keyTest[page][key][cnt][tt];

    if(tt < keyTest[page][key][cnt].length)
    {
        var str = temp.split(' ');
        var sCase = str[0].toLowerCase();   //string checker

        //similar to autoprocess
        if(str.length > 0) {
            if(sCase == 'd' || sCase == 'delay')
                dur += parseInt(str[1]);
            else if(sCase == 'o' || sCase == 'on')
                if(str[3].toLowerCase() == 'a' || str[3].toLowerCase() == 'auto')
                    onLED2(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[4]);
                else
                    onLED2(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[3]);
            else if(sCase == 'f' || sCase == 'off')
                offLED(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));
        }

        dur--;
        if(dur < 0)
            dur = 0;

        if(dur >= 1)
            st = setTimeout(keyLED1,dur,page,key,cnt,tt+1);
        else
            keyLED1(page, key, cnt, tt+1);
    }
}

//code for off the keyLED.. but not use
// function keyLED2(page, key, cnt, tt) {
//     var temp = keyTest[nowPage][key][cnt];
//     //if there isn't LEDSET
//     if(typeof temp == 'undefined')
//         cnt = 0;
    
//     temp = keyTest[nowPage][key][cnt][tt];
//     if(tt < keyTest[page][key][cnt].length)
//     {
//         var str = temp.split(' ');
//         var sCase = str[0].toLowerCase();
//         if(str.length > 0)
//             if(sCase == 'o' || sCase == 'f' || sCase == 'on' || sCase == 'off')
//                 offLED(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));
//         keyLED2(page, key, cnt, tt+1);
//     }
// }

//stop auto process
function stopT() {
    //all timer out
    clearTimeout(st);
    autoP = false;
    for(var i = 0 ; i < keyX*keyY; i++)
        offLED(nowPage, i);
    initz();
}

//color chage code
function s2c(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

// init all arrays
function arrinit() {
    // zip init
    ablob.length=0;
    lstring.length=0;
    sList.length=0;
    ablob = [];
    lstring = [];
    ablob[0] = [];
    ablob[1] = [];
    lstring[0] = [];
    lstring[1] = [];
    // songs list init
    sound.length = 0;
    audio.length = 0;
    pressedKey.length = 0;
    coloredKey.length = 0;
    keyCount.length = 0;
    counter.length = 0;
    keyTest.length=0;
    audioInstance.length=0;
    drect.length=0;
    dcir.length=0;
    rects.length = 0;
    cirs.length = 0;
    cirs2.length = 0;
    for(var j = 0 ; j < chain; j++)
    {
        sound[j] = [];
        audio[j] = [];
        coloredKey[j] = [];
        keyCount[j] = [];
        counter[j] = [];
        keyTest[j] = [];
        for(var i = 0 ; i < keyX*keyY; i++)
        {
            sound[j][i] = [];
            audio[j][i] = [];
            pressedKey[i] = 0
            coloredKey[i] = "#FF0000";
            keyCount[j][i] = 0;
            counter[j][i] = 0;
            keyTest[j][i] = [];
        }
    }
}

//button led initializer
function initz() {
    pressedKey.fill(0);
    coloredKey.fill(strokeColor);
}