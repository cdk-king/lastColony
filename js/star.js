var star = {
    canvas:document.createElement("canvas"),
    width:0,
    height:0,
    delay:600,
    lastAnimateTime: (new Date()).getTime(),
    risingstars:[],
    twinklingStars:[],
    twinklingStarsNum:20,
    star_pic:new Image(),
    star2_pic:new Image(),
    stop:false,
    earth:{
        x:450,
        y:328,
        r:160
    },
    init:function(){
        this.star_pic.src = "images/star2.png";
        this.star2_pic.src = "images/star1.png";

        var gameContainer = document.getElementById("gamecontainer");
        var gameScale = gameContainer.clientWidth/640;
        this.width = document.getElementById("gamecontainer").clientWidth*gameScale;
        this.height = document.getElementById("gamecontainer").clientHeight*gameScale;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.style.zIndex = -10;
        //this.canvas.style.border = "1px solid red";
        this.context = this.canvas.getContext("2d");
        document.getElementById("gamestartscreen").appendChild(this.canvas);

        
        //初始化闪烁星星
        for(var i = 0;i<star.twinklingStarsNum;i++){
            star.createTwinklingStars();
        }
    },
    animate:function(){
       
        var now =  (new Date()).getTime();
        var diffTime = now-star.lastAnimateTime;
        if(diffTime>star.delay){
            star.lastAnimateTime = now;
            star.createRisingStars();
        }

        star.animateRisingStars();
        star.draw();
        if(!star.stop){
            window.requestAnimationFrame(star.animate, star.canvas);
        }
       
    },
    createRisingStars:function(){
        var item = {};
        item.x = Math.random() * star.width;
        item.y = star.height;
        item.vx = 0;
        item.vy = -1.2;
        star.risingstars.push(item);
    },
    createTwinklingStars:function(){
        var now =  (new Date()).getTime();
        var item = {};
        item.x =star.width/2+  Math.random() * star.width/2;
        item.y = Math.random() * star.height/4;
        item.vx = 0;
        item.vy = 0;
        item.lifeTime = (Math.random()*2 + 2) * 1000;
        item.time = now;
        item.globalAlpha = 0;
        star.twinklingStars.push(item);
    },
    animateRisingStars:function(){
        for(var j= 0;j<star.risingstars.length;j++){
            var item = star.risingstars[j];
            if(item.y+item.vy<0){
                star.risingstars.splice(j, 1);
                j--;
            }else{
                item.x = item.x+item.vx;
                item.y = item.y+item.vy;
            }

        }
    },
    animateTwinklingStars:function(item){
        var now =  (new Date()).getTime();
        item.x =star.width/2+  Math.random() * star.width/2;
        //console.log(item.y);
        item.y = Math.random() * star.height/4;
        item.vx = 0;
        item.vy = 0;
        item.lifeTime = (Math.random()*2 + 2) * 1000;
        item.time = now;
        item.globalAlpha = 0;
    },
    draw:function(){
        star.context.clearRect(0, 0, star.canvas.width, star.canvas.height);
        star.drawRisingStars();
        star.drawTwinklingStars();
        // star.context.beginPath();
        // star.context.fillStyle = "white";
        // star.context.clearRrc(star.earth.x, star.earth.y,  star.earth.r, 0, Math.PI * 2, false);
        // star.context.fill(); 
    },
    drawRisingStars:function(){
        for(var j= 0;j<star.risingstars.length;j++){
            var item = star.risingstars[j];
            star.context.save();
            star.context.beginPath();
            star.context.globalAlpha = 1;
            star.context.fillStyle = "white";
            star.context.arc(item.x, item.y, 2, 0, Math.PI * 2, false);
            star.context.fill();
            star.context.closePath();
            star.context.restore();
        }
    },
    drawTwinklingStars:function(){
        var ctx1 = star.context;
        var now =  (new Date()).getTime();
        for(var j= 0;j<star.twinklingStars.length;j++){
            var item = star.twinklingStars[j];
            if(now-item.time>item.lifeTime){
                item.time = now;
                star.animateTwinklingStars(item);
            }else if(now-item.time<2*item.lifeTime/5){
                ctx1.save();
                ctx1.globalAlpha = item.globalAlpha;
                ctx1.beginPath();
                ctx1.drawImage(star.star_pic, item.x, item.y, 15 , 15);
                ctx1.closePath();
                ctx1.restore();
                item.globalAlpha =  2*(now-item.time)/item.lifeTime;
                //console.log((now-item.time)/item.lifeTime);
            }else if(now-item.time<3*item.lifeTime/5){
                ctx1.save();
                ctx1.globalAlpha =  item.globalAlpha;
                ctx1.beginPath();
                ctx1.drawImage(star.star2_pic, item.x, item.y, 15 , 15);
                ctx1.closePath();
                ctx1.restore();
                if((now-item.time)/item.lifeTime<0.5){
                    item.globalAlpha =  2*(now-item.time)/item.lifeTime;
                }else{
                    item.globalAlpha = 1- 2*((now-item.time)/item.lifeTime-0.5);
                }
                //item.globalAlpha = 1;
            }else{
                ctx1.save();
                ctx1.globalAlpha =  item.globalAlpha;
                ctx1.beginPath();
                ctx1.drawImage(star.star2_pic, item.x, item.y, 15 , 15);
                ctx1.closePath();
                ctx1.restore();
                item.globalAlpha = 1- 2*((now-item.time)/item.lifeTime-0.5);
            }
        }
        ctx1.globalAlpha = 1;
    }
}
