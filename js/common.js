(function(){
    var lastTime = 0;
    var vendors = ["ms","moz","webkit","0"];
    for(var x = 0;x<vendors.length && !window.requestAnimationFrame;x++){
        window.requestAnimationFrame = window[vendors[x]+"RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x]+"CancelRequestAnimationFrame"] || window[vendors[x]+"CannelAnimationFrame"];
    }
    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback,element){
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0,16-(currTime-lastTime));
            var id = window.setTimeout(function(){
                callback(currTime+timeToCall);
            },timeToCall);
            lastTime = currTime+timeToCall;
            return id;
        };
    }
    if(!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function(id){
            clearTimeout(id);
        }
    }
}());

var loader = {
    loaded:true,
    loadedCount:0,//已加载的资源数
    totalCount:0,//需要被加载的资源总数

    init:function(){
        //检查浏览器支持的声音格式
        var mp3Support;
        var oggSupport;
        var audio = document.createElement("audio");
        if(audio.canPlayType){
            //当前canPlayType()方法返回“”、“maybe”、“probably”
            mp3Support = "" != audio.canPlayType("audio/mpeg");
            oggSupport = "" != audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        }else{
            //audio标签不支持
            mp3Support = false;
            oggSupport = false;
        }
        //检查ogg、mp3，如果都不支持，就将soundFileExtn设置成undefined
        loader.soundFileExtn = mp3Support?".mp3":oggSupport?".ogg":undefined;
    },
    loadImage:function(url){
        this.totalCount++;
        this.loaded = false;
        //game.hideScreens();
        game.showScreen("loadingscreen");
        var image = new Image();
        image.src = url;
        
        image.onload = loader.itemLoaded;
        return image;
    },
    soundFileExtn:".mp3",
    loadSound:function(url){
        this.totalCount++;
        this.loaded = false;
        game.showScreen("loadingscreen");
        var audio = new Audio();
        audio.src = url +loader.soundFileExtn;
        audio.addEventListener("canplaythrough",loader.itemLoaded,false);
        return audio;
    },
    itemLoaded:function(ev){
        // 加载此项目后，停止侦听其事件类型（加载或canPlayThrough）
        ev.target.removeEventListener(ev.type, loader.itemLoaded, false);
        loader.loadedCount++;
        document.getElementById("loadingmessage").innerHTML = "已加载 " + loader.loadedCount + " 共 " + loader.totalCount;
        if(loader.loadedCount == loader.totalCount){
            //loader完成了资源加载
            loader.loaded = true;
            //隐藏加载页面
            
            //game.hideScreen("loadingscreen");
            //如果loader.onload事件有响应函数，调用
            if(loader.onload){
                setTimeout(function(){
                    game.hideScreen("loadingscreen");
                    loader.onload();
                    loader.onload = undefined;
                },500);
            }
        }
    }
}