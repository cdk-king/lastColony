var fog = {
    grid:[],
    canvas:document.createElement("canvas"),
    initLevel:function(){
        //设置fog canvas的尺寸为地图大小
        this.canvas.width = game.currentLevel.mapGridWidth*game.gridSize;
        this.canvas.height = game.currentLevel.mapGridHeight*game.gridSize;

        this.context = this.canvas.getContext("2d");

        //迷雾网格是元素值均为1的数组
        this.defaultFogGrid = [];
        for(var i = 0;i<game.currentLevel.mapGridHeight;i++){
            this.defaultFogGrid[i] = [];
            for(var j  = 0;j<game.currentLevel.mapGridWidth;j++){
                this.defaultFogGrid[i][j] = 1;
            }
        }

    },
    isPointOverFog:function(x,y){
        //如果点在地图之外，则认为它是处在迷雾中的
        if(y<0 || y/game.gridSize>=game.currentLevel.mapGridHeight || x<0 || x/game.gridSize >= game.currentLevel.mapGridWidth){
            return true;
        }
        //否则，基于玩家的迷雾网格来返回值
        return this.grid[game.team][Math.floor(y/game.gridSize)][Math.floor(x/game.gridSize)] == 1;
    },
    animate:function(){
        //迷雾使用半透明的黑色填充
        this.context.drawImage(game.currentMapImage,0,0);
        this.context.fillStyle = "rgba(0,0,0,0.5)";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);

        //初始化玩家的迷雾格网
        this.grid[game.team] = game.makeArrayCopy(this.defaultFogGrid);

        //为所有玩家单位的视野清除迷雾
        //globalCompositeOperation 属性设置或返回如何将一个源（新的）图像绘制到目标（已有）的图像上。 
        //destination-out	在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
        fog.context.globalCompositeOperation = "destination-out";

        for(var i = game.items.length-1;i>=0;i--){
            var item = game.items[i];
            var team = game.team;
            if(item.team == team && !item.keepFogged){
                var x = Math.floor(item.x);
                var y = Math.floor(item.y);
                var x0 = Math.max(0,x-item.sight+1);
                var y0 = Math.max(0,y-item.sight+1);
                var x1 = Math.min(game.currentLevel.mapGridWidth-1,x+item.sight-1+(item.type=="buildings"?item.baseWidth/game.gridSize:0));
                var y1 = Math.min(game.currentLevel.mapGridHeight-1,y+item.sight-1+(item.type=="buildings"?item.baseWidth/game.gridSize:0));
                for(var j = x0;j<=x1;j++){
                    for(var k = y0;k<=y1;k++){
                        if(this.grid[team][k][j]){
                            // this.context.fillStyle = "rgba(100,0,0,0.5)";
                            // this.context.beginPath();
                            // this.context.arc(j*game.gridSize+12,k*game.gridSize+12,16,0,2*Math.PI,false);
                            // this.context.fill();
                            // this.context.fillStyle = "rgba(100,0,0,0.4)";
                            // this.context.beginPath();
                            // this.context.arc(j*game.gridSize+12,k*game.gridSize+12,18,0,2*Math.PI,false);
                            // this.context.fill();
                            // this.context.fillStyle = "rgba(100,0,0,0.3)";
                            // this.context.beginPath();
                            // this.context.arc(j*game.gridSize+12,k*game.gridSize+12,24,0,2*Math.PI,false);
                            // this.context.fill();
                        }
                        this.grid[team][k][j] = 0;
                    }
                }
                this.context.fillStyle = "rgba(100,0,0,0.7)";
                this.context.beginPath();
                if(item.type=="buildings"){
                    this.context.arc(item.x*game.gridSize+item.baseWidth/2,item.y*game.gridSize+item.baseHeight/2,(item.sight+0.5)*game.gridSize,0,2*Math.PI,false);
                }else{
                    this.context.arc(item.x*game.gridSize,item.y*game.gridSize,(item.sight+0.5)*game.gridSize,0,2*Math.PI,false);
                }
                this.context.fill();
            }
        }

        fog.context.globalCompositeOperation = "source-over";
    },
    draw:function(){
        game.foregroundContext.drawImage(this.canvas,game.offsetX,game.offsetY,
        game.canvasWidth,game.canvasHeight,0,0,game.canvasWidth,game.canvasHeight);
    }
}