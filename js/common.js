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
                },250);
            }
        }
    }
}

// 默认的load()方法被游戏中的所有单位使用
function loadItem(name){
    //this指向的也只是它上一级的对象
    var item = this.list[name];
    //如果单位的子画面序列已经加载，就没必要在此加载了
    //this指向的也只是它上一级的对象
    if(item.spriteArray){
        return;
    }
    item.spriteSheet = loader.loadImage("images/"+this.defaults.type+"/"+name+".png");
    item.spriteArray = [];
    item.spriteCount = 0;

    for(var i = 0;i<item.spriteImages.length;i++){
        var constructImageCount = item.spriteImages[i].count;
        var constructDirectionCount = item.spriteImages[i].directions;
        if(constructDirectionCount){
            for(var j = 0;j<constructDirectionCount;j++){
                var constructImageName = item.spriteImages[i].name+"-"+j;
                item.spriteArray[constructImageName] = {
                    name:constructImageName,
                    count:constructImageCount,
                    offset:item.spriteCount
                };
                item.spriteCount += constructImageCount;
            }
        }else{
            var constructImageName = item.spriteImages[i].name;
            item.spriteArray[constructImageName] = {
                name:constructImageName,
                count:constructImageCount,
                offset:item.spriteCount
            };
            item.spriteCount += constructImageCount;
        }
    }  
}
////对于仍不支持object.assign的一些浏览器，polyfill
//Object.assign(target, ...sources)方法用来将源对象（source）的所有可枚举属性，复制到目标对象（target）。
if(typeof Object.assign!=="function"){
    //垫片
    Object.assign = function(target, varArgs) { 
        "use strict";//严格模式
        if (target === null) { // TypeError if undefined or null
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var to = Object(target);//new Object([value])

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    //判断一个属性是定义在对象本身而不是继承自原型链
                    //使用原型链上真正的 hasOwnProperty 方法
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }

        return to;
        
    }
}

// 默认的add()方法被游戏中所有的单位使用
function addItem(details){
    var item = {};
    var name = details.name;

    Object.assign(item, this.defaults);

    Object.assign(item, this.list[name]);

    item.life = item.hitPoints;

    Object.assign(item, details);

    return item;
}

//转向和移动的通用函数
//根据两个物体的位置计算一个方向（满足0<=angle<=directions）
function findAngle(object,unit,directions){
    var dy = (object.y)-unit.y;
    var dx = object.x-unit.x;
    //将正切值转换0到directions之间的值
    //[-π, π] 需要转换成0-360
    var angle = wrapDirection(directions/2-(Math.atan2(dx,dy)*directions/(2*Math.PI)),directions);
    return angle;
}

//处理方向值，使其在0到directions-1之间
function wrapDirection(direction,directions){
    if(direction<0){
        direction += directions;
    }
    if(direction>=directions){
        direction -= directions;
    }
    return direction;
}

//返回两个角度（0<=angle<directions）之间的最小差值（-direction/2到+directions/2）之间的值

function angleDiff(angle1,angle2,directions){
    if(angle1>=directions/2){
        angle1 = angle1 - directions;
    }
    if(angle2>=directions/2){
        angle2 = angle2 - directions;
    }

    var diff = angle2-angle1;
    
    if(diff<-directions/2){
        diff+=directions;
    }
    if(diff>directions/2){
        diff -=directions;
    }

    return diff;
}


