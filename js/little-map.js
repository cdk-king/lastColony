var littleMap = {
    canvas:document.createElement("canvas"),
    scale:10,
    init:function(){
        //设置fog canvas的尺寸为地图大小
        this.canvas.width = 150;
        this.canvas.height = 150;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        this.canvas.style.right = "5px";
        this.canvas.style.left = "initial";
        //this.canvas.style.border = "1px solid black";
        this.context = this.canvas.getContext("2d");
        document.getElementById("gameinterfacescreen").appendChild(this.canvas);
        for(var i = 0;i<game.items.length;i++){
            var item = game.items[i];
            if(item.x>10){
                console.log(item);
            }
        }
        
    },
    draw:function(){
        var scale = game.currentMapImage.height/game.currentMapImage.width;
        var width = 150;
        var height = scale*width;
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
    }
}