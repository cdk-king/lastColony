var star = {
    canvas:document.createElement("canvas"),
    width:0,
    height:0,
    delay:600,
    lastAnimateTime: (new Date()).getTime(),
    stars:[],
    stop:false,
    init:function(){
        this.width = document.getElementById("gamecontainer").clientWidth*game.scale;
        this.height = document.getElementById("gamecontainer").clientHeight*game.scale;
        //console.log(game.scale);
        //console.log(this.width);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        //this.canvas.style.right = "4px";
        this.canvas.style.left = "0px";
        this.canvas.style.zIndex = -10;
        //this.canvas.style.border = "1px solid red";
        this.context = this.canvas.getContext("2d");
        document.getElementById("gamestartscreen").appendChild(this.canvas);
    },
    animate:function(){
       
        var now =  (new Date()).getTime();
        var diffTime = now-star.lastAnimateTime;
        //console.log(diffTime);
        if(diffTime>star.delay){
            star.lastAnimateTime = now;
            var item = {};
            item.x = Math.random() * star.width;
            item.y = star.height;
            item.vx = 0;
            item.vy = -1.2;
            star.stars.push(item);
        }

        for(var j= 0;j<star.stars.length;j++){
            var item = star.stars[j];
            if(item.y+item.vy<0){
                star.stars.splice(j, 1);
                j--;
            }else{
                item.x = item.x+item.vx;
                item.y = item.y+item.vy;
                //console.log(item.y);
            }

        }
        //console.log(star.stars.length);
        star.draw();
        if(!star.stop){
            window.requestAnimationFrame(star.animate, star.canvas);
        }
       
    },
    draw:function(){
        star.context.clearRect(0, 0, star.canvas.width, star.canvas.height);
        for(var j= 0;j<star.stars.length;j++){
            var item = star.stars[j];
            star.context.beginPath();
            star.context.fillStyle = "white";
            star.context.arc(item.x, item.y, 2, 0, Math.PI * 2, false);
            star.context.fill();
        }
    }
}
