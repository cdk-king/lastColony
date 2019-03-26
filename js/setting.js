var setting = {
    init:function(){

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
        if(!isFullscreen){//进入全屏,多重短路表达式
            console.log("进入全屏");
            
        (document.body.requestFullscreen&&document.body.requestFullscreen())||
        (document.body.mozRequestFullScreen&&document.body.mozRequestFullScreen())||
        (document.body.webkitRequestFullscreen&&document.body.webkitRequestFullscreen())||(document.body.msRequestFullscreen&&document.body.msRequestFullscreen());
        target.src = "images/icon/zoomOut.png";
        }else{	//退出全屏,三目运算符
        document.exitFullscreen?document.exitFullscreen():
        document.mozCancelFullScreen?document.mozCancelFullScreen():
        document.webkitExitFullscreen?document.webkitExitFullscreen():'';
        target.src = "images/icon/zoomIn.png";
        }
    },
    backgroundSound:function(event){
        var target = event.srcElement||event.target;
        if(sounds.backgroundSound){
            sounds.backgroundSound = false;
            target.src = "images/icon/音效开.png";
        }else{
            sounds.backgroundSound = true;
            target.src = "images/icon/音效关.png";
        }
    },
    backgroundMusic:function(){
        
    }
}