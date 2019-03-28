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