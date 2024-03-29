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
        //console.log(ev.target.callback);
        if(ev.target.callback){
            ev.target.callback();
        }
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
                    if(typeof loader.onload=="function"){
                        loader.onload();
                    }
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
    if(item.isSheet){
        item.spriteSheet = loader.loadImage("images/"+this.defaults.type+"/"+item.sheetName+".png");
    }else{
        item.spriteSheet = loader.loadImage("images/"+this.defaults.type+"/"+name+".png");
    }
    
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
    };
    //如果单位具有武器，同时加载武器
    if(item.weaponType){
        bullets.load(item.weaponType);
    }  
}
////对于仍不支持object.assign的一些浏览器，polyfill
//Object.assign(target, ...sources)方法用来将源对象（source）的所有可枚举属性，复制到目标对象（target）。
//Object.assign() 只是一级属性复制，比浅拷贝多深拷贝了一层而已。用的时候，还是要注意这个问题的。
//发现一个可以简单实现深拷贝的方法，当然，有一定限制，如下：
//const obj1 = JSON.parse(JSON.stringify(obj));
//思路就是将一个对象转成json字符串，然后又将字符串转回对象。
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

    item.isAdd = true;

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

function findFiringAngle(target,source,directions){
    var dy = target.y-source.y;
    var dx = target.x-source.x;
    
    if(target.type == "buildings"){
        //console.log(target.baseWidth);
        dy += target.baseHeight/2/game.gridSize;
        dx += target.baseWidth/2/game.gridSize;
    }else if(target.type == "aircraft"){
        dy -= target.pixelShadowHeight/game.gridSize;
    }

    if(source.type == "buildings"){
        dy -= source.baseHeight/2/game.gridSize;
        dx -= source.baseWidth/2/game.gridSize;
    }else if(source.type == "aircraft"){
        dy += source.pixelShadowHeight/game.gridSize;
    }

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

//战斗有关的公用方法
function isValidTarget(item){
    return item.team !=this.team && (
        this.canAttackLand && (item.type == "buildings" || item.type == "vehicles") || (this.canAttackAir && (item.type == "aircraft") ) 
    );
    
}

function findTargetsInSight(increment){
    if(!increment){
        increment=0;
    }
    var targets = [];
    for(var i = game.items.length-1;i>=0;i--){
        var item = game.items[i];
        if(this.isValidTarget(item)){
            if(Math.pow(item.x-this.x,2)+Math.pow(item.y-this.y,2)<Math.pow(this.sight+increment,2)){
                targets.push(item);
            }
        }
    };

    //按照与攻击者的距离对目标进行排序
    var attacker = this;
    
    targets.sort(function(a, b) {
        return (Math.pow(a.x - attacker.x, 2) + Math.pow(a.y - attacker.y, 2)) - (Math.pow(b.x - attacker.x, 2) + Math.pow(b.y - attacker.y, 2));
    });

    return targets;
}

function findAllTargetsInSight(increment){
    if(!increment){
        increment=0;
    }
    var targets = [];
    for(var i = game.items.length-1;i>=0;i--){
        var item = game.items[i];
        if(Math.pow(item.x-this.x,2)+Math.pow(item.y-this.y,2)<Math.pow(this.sight+increment,2)){
            targets.push(item);
        }
    };

    //按照与攻击者的距离对目标进行排序
    var attacker = this;
    
    targets.sort(function(a, b) {
        return (Math.pow(a.x - attacker.x, 2) + Math.pow(a.y - attacker.y, 2)) - (Math.pow(b.x - attacker.x, 2) + Math.pow(b.y - attacker.y, 2));
    });

    return targets;
}

function isItemDead(uid){
    var item = game.getItemByUid(uid);
    return (!item || item.lifeCode == "dead");
}

function drawOrder(){
    //判断当前单位有无被选中
    if(!this.selected){
        return;
    }
    if(this.orders.to && (this.team==game.team)){
        switch (this.orders.type){
            case "move":
                var start = [this.x,this.y];
                var end = [this.orders.to.x,this.orders.to.y];
                drawOrderLine(start,end,"#FFEC8B",8,0,3);
                
                break;
            case "attack":
                if(this.isValidTarget(this.orders.to)){
                    if(this.type == "aircraft"){
                        var start = [this.x,this.y-this.pixelShadowHeight/game.gridSize];
                    }else{
                        var start = [this.x,this.y];
                    }
                    
                    if(this.orders.to.type=="buildings"){
                        var end = [this.orders.to.x+this.orders.to.baseWidth/2/game.gridSize,this.orders.to.y+this.orders.to.baseHeight/2/game.gridSize];
                    }else if(this.orders.to.type=="aircraft"){
                        var end = [this.orders.to.x,this.orders.to.y-this.orders.to.pixelShadowHeight/game.gridSize];
                    }
                    else{
                        var end = [this.orders.to.x,this.orders.to.y];
                    }
                    drawOrderLine(start,end,"#FF4040",8,0,3);
                    
                }
                break;
            case "moveAndAttack":
                var start = [this.x,this.y];
                var end = [this.orders.to.x,this.orders.to.y];
                drawOrderLine(start,end,"#FF4040",8,0,3);
                break;
            case "guard":
                if(this.type == "aircraft"){
                    var start = [this.x,this.y-this.pixelShadowHeight/game.gridSize];
                }else{
                    var start = [this.x,this.y];
                }
                
                if(this.orders.to.type=="buildings"){
                    var end = [this.orders.to.x+this.orders.to.baseWidth/2/game.gridSize,this.orders.to.y+this.orders.to.baseHeight/2/game.gridSize];
                }else if(this.orders.to.type=="aircraft"){
                    var end = [this.orders.to.x,this.orders.to.y-this.orders.to.pixelShadowHeight/game.gridSize];
                }
                else{
                    var end = [this.orders.to.x,this.orders.to.y];
                }
                drawOrderLine(start,end,"#98FB98",0,0,3);
                
                break;
        }
    }
}

function drawOrderLine(start,end,color,lineDash,arcDash,r){
    game.foregroundContext.beginPath();
    game.foregroundContext.strokeStyle = color;
    game.foregroundContext.setLineDash([lineDash]);
    game.foregroundContext.moveTo(start[0]*game.gridSize-game.offsetX,start[1]*game.gridSize-game.offsetY);

    game.foregroundContext.lineTo(end[0]*game.gridSize-game.offsetX,end[1]*game.gridSize-game.offsetY);
    game.foregroundContext.stroke();
    game.foregroundContext.beginPath();
    game.foregroundContext.setLineDash([arcDash]);
    game.foregroundContext.arc(end[0]*game.gridSize-game.offsetX,end[1]*game.gridSize-game.offsetY,r,0,Math.PI*2,false); 
    game.foregroundContext.stroke();
    
}

//判断对象类型
function getType(o){
    var _t;
    return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
}

//获取标签对象的css样式
function getStyle(el, styleName) {
    return el.style[styleName] ? el.style[styleName] : el.currentStyle ? el.currentStyle[styleName] : window.getComputedStyle(el, null)[styleName];
}

function getStyleNum(el, styleName) {
    return parseInt(getStyle(el, styleName).replace(/px|pt|em/ig,''));
}

//设置标签对象的css样式
function setStyle(el, obj){
    if (getType(obj) == "object") {
        //for in 获取属性名
        for (s in obj) {
            console.log(s);
            var cssArrt = s.split("-");
            for (var i = 1; i < cssArrt.length; i++) {
                //大写替换
                cssArrt[i] = cssArrt[i].replace(cssArrt[i].charAt(0), cssArrt[i].charAt(0).toUpperCase());
            }
            //join() 方法用于把数组中的所有元素放入一个字符串。元素是通过指定的分隔符进行分隔的。 
            var cssArrtnew = cssArrt.join("");
            console.log(cssArrtnew);
            el.style[cssArrtnew] = obj[s];
        }
    }
    else 
        if (getType(obj) == "string") {
            el.style.cssText = obj; 
        }
   }
//获取标签真实高宽
function getSize(el) {
    if (getStyle(el, "display") != "none") {
        return { width: el.offsetWidth || getStyleNum(el, "width"), height: el.offsetHeight || getStyleNum(el, "height") };
    }
    var _addCss = { display: "", position: "absolute", visibility: 'hidden' };
    var _oldCss = {};
    for (i in _addCss) {
        _oldCss[i] = getStyle(el, i);
    }
    setStyle(el, _addCss);
    var _width = el.clientWidth || getStyleNum(el, "width");
    var _height = el.clientHeight || getStyleNum(el, "height");
    for (i in _oldCss) {
        setStyle(el, _oldCss);
    }
    return { width: _width, height: _height };
} 
// window.onload = function(){
//     var _addCss = { display: "", position: "absolute", visibility: 'hidden' };
//     var bar = document.getElementsByClassName("bar")[0];
//     console.log(bar);
//     setStyle(bar, _addCss);
// }

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
     return dataURL;
    //return dataURL.replace("data:image/png;base64,", ""); 
}
