var littleMap = {
    canvas:document.createElement("canvas"),
    scale:10,
    canvasWidth:150,
    canvasHeight:150,
    mousedown:false,
    init:function(){
        //设置fog canvas的尺寸为地图大小
        this.canvas.width = littleMap.canvasWidth;
        this.canvas.height = littleMap.canvasHeight;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        this.canvas.style.right = "4px";
        this.canvas.style.left = "initial";
        //this.canvas.style.border = "1px solid black";
        this.context = this.canvas.getContext("2d");
        document.getElementById("gameinterfacescreen").appendChild(this.canvas);
        this.canvas.addEventListener("mousemove", this.mousemovehandler, false);
        this.canvas.addEventListener("mousedown", this.mousedownhandler, false);
        this.canvas.addEventListener("mouseup", this.mouseuphandler, false);
    },
    draw:function(){
        var scale = game.currentMapImage.height/game.currentMapImage.width;
        var width = littleMap.canvasWidth;
        var height = scale*width;
        this.width = width;
        this.height = height;
        this.context.drawImage(game.currentMapImage,0,0,
            game.currentMapImage.width,game.currentMapImage.height,0,(width-height)/2,width,height);
        this.context.fillStyle = "red";
        this.context.strokeStyle = "black";
        this.context.beginPath();
        //this.context.strokeRect(0,0,width,width);
        //this.context.stroke();
        for(var i = 0;i<game.items.length;i++){
            var item = game.items[i];
            if(item && item.type != "bullets"){
                if(item.team == "blue"){
                    this.context.fillStyle = "blue";
                }else if(item.team == "green"){
                    this.context.fillStyle = "red";
                }
                this.context.fillRect(item.x*width/game.currentLevel.mapGridWidth,item.y*height/game.currentLevel.mapGridHeight+(width-height)/2,4,4);
                this.context.fill();
            }
        }
        this.context.strokeStyle = "white";
        var strokeX = game.offsetX*width/(game.gridSize*game.currentLevel.mapGridWidth);
        var strokeY = game.offsetY*height/(game.gridSize*game.currentLevel.mapGridHeight)+(width-height)/2;
        var strokeWidth = game.foregroundCanvas.width*width/(game.gridSize*game.currentLevel.mapGridWidth);
        var strokeHeight = game.foregroundCanvas.height*height/(game.gridSize*game.currentLevel.mapGridHeight);
        this.context.strokeRect(strokeX,strokeY+1,strokeWidth,strokeHeight-2);
        this.context.stroke();
    },
    mousedownhandler:function(ev){
        littleMap.do(ev);
        littleMap.mousedown = true;
        
    },
    mouseuphandler:function(ev){
        littleMap.mousedown = false;
    },
    mousemovehandler:function(ev){
        if(littleMap.mousedown){
            littleMap.do(ev);
        }
    },
    do:function(ev){
        //console.log("littleMap do");
        var clientX = ev.clientX;
        var clientY = ev.clientY;
        let offset = littleMap.canvas.getBoundingClientRect();
        littleMap.x = Math.round((clientX - offset.left)/game.scale);
        littleMap.y = Math.round((clientY - offset.top-(littleMap.width-littleMap.height)/2)/game.scale);
        //console.log(littleMap.x);
        //console.log(littleMap.y);
        var gameX =(littleMap.x/littleMap.canvasWidth)*game.currentLevel.mapGridWidth;
        var gameY = (littleMap.y/littleMap.height)*game.currentLevel.mapGridHeight;
        if((gameX*game.gridSize)-game.canvasWidth/2<0){
            game.offsetX =0;
        }else if((gameX*game.gridSize)+game.canvasWidth/2>game.currentLevel.mapGridWidth*game.gridSize){
            game.offsetX = game.currentLevel.mapGridWidth*game.gridSize-game.canvasWidth;
        }else{
            game.offsetX = (gameX*game.gridSize)-game.canvasWidth/2; 
        }
        if((gameY*game.gridSize)-game.canvasHeight/2<0){
            game.offsetY =0;
        }else if((gameY*game.gridSize)+game.canvasHeight/2>game.currentLevel.mapGridHeight*game.gridSize){
            game.offsetY = game.currentLevel.mapGridHeight*game.gridSize-game.canvasHeight;
        }else{
            game.offsetY = (gameY*game.gridSize)-game.canvasHeight/2;
        }
    }
}