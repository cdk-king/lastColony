var setting = {
    init:function(){
        setting.initVolumeController();
    },
    initVolumeController:function(){
        var box = document.getElementsByClassName('box')[0];
        
        var bar = document.getElementsByClassName('bar')[0];
        var barContainer = document.getElementsByClassName('barContainer')[0];
        var barContainerP = barContainer.getElementsByTagName('p')[0];
        // console.log(bar.offsetWidth);
        // console.log(box.offsetWidth);
        //offsetWidth为可视化宽度
        var barWidth = getSize(bar).width;
        var boxWidth = getSize(box).width;
        var cha = barWidth - boxWidth;
        box.style.left = (sounds.volume?sounds.volume:0.5)*cha + 'px';
        barContainerP.innerHTML = (sounds.volume?sounds.volume:0.5)*100 + '%';
        box.onmousedown = function (ev) {
            console.log("box.onmousedown");
            let boxL = box.offsetLeft
            let e = ev || window.event //兼容性
            let mouseX = e.clientX //鼠标按下的位置
            barContainer.onmousemove = function (ev) {
                let e = ev || window.event;
                let moveL = e.clientX - mouseX; //鼠标移动的距离
                let newL = boxL + moveL; //left值
                
                if (newL < 0) {
                    newL = 0;
                }
                if (newL >= cha) {
                    newL = cha;
                }
                
                // 改变left值
                box.style.left = newL + 'px';
                let bili = newL / cha * 100;
                sounds.volume = bili/100;
                barContainerP.innerHTML = Math.ceil(bili) + '%';
                return false; //取消默认事件
            }
            document.getElementById('settingscreen').onmouseup = function () {
                barContainer.onmousemove = false; //解绑移动事件
                return false;
            }
            // document.getElementById('settingscreen').onmouseover = function () {
            //     console.log("onmouseout");
            //     barContainer.onmousemove = false; //解绑移动事件
            //     return false;
            // }
            return false;
        }
    },
    showSetting:function(){
        //显示游戏设置界面
        //game.hideScreens();
        game.showScreen("settingscreen");
    },
    hideSettingScreen:function(){
        game.hideScreen('settingscreen');
    },
    fullScreen:function(event){
        var target = event.srcElement||event.target;
        var isFullscreen=document.fullScreen||document.mozFullScreen||document.webkitIsFullScreen;
        var el=document.getElementsByTagName('html')[0]; 
        if(!isFullscreen){//进入全屏,多重短路表达式 
            console.log("进入全屏");
        
        (el.requestFullscreen&&el.requestFullscreen())||
        (el.mozRequestFullScreen&&el.mozRequestFullScreen())||
        (el.webkitRequestFullscreen&&el.webkitRequestFullscreen())||(el.msRequestFullscreen&&el.msRequestFullscreen());
        target.src = "images/icon/zoomIn.png";
        setting.showSettingMessage("全屏已开启",2000);
        }else{	//退出全屏,三目运算符
            console.log("退出全屏");
        document.exitFullscreen?document.exitFullscreen():
        document.mozCancelFullScreen?document.mozCancelFullScreen():
        document.webkitExitFullscreen?document.webkitExitFullscreen():'';
        target.src = "images/icon/zoomOut.png";
        setting.showSettingMessage("全屏已关闭",2000);
        }
    },
    backgroundSound:function(event){
        var target = event.srcElement||event.target;
        if(sounds.backgroundSound){
            sounds.backgroundSound = false;
            target.src = "images/icon/音效关.png";
            setting.showSettingMessage("音效已关闭",2000);
        }else{
            sounds.backgroundSound = true;
            target.src = "images/icon/音效开.png";
            setting.showSettingMessage("音效已开启",2000);
        }
    },
    backgroundMusic:function(){
        
    },
    showSettingMessage:function(content,delay){
        var el = document.getElementById("settingMessage");
        el.innerHTML = "<span>"+content+"</span>";
        var timer = setTimeout(function(){
            el.innerHTML = "";
            clearTimeout(timer);
        },delay);
    }
}