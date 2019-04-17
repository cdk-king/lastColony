var keyboard = {
    //通关指令
    endLevel:"697868",//end
    input:"",
    checkCommend:function(currKey){
        this.input=this.input+currKey;
        console.log(this.input);
        if(this.input.indexOf(this.endLevel)!=-1){
            this.input="";
            singleplayer.endLevel(true);
        }
    },
    init:function(){
        var body = document.body;
        document.onkeydown=function(event){
            
            var e = event || window.event || arguments.callee.caller.arguments[0];
            var currKey=e.keyCode||e.which||e.charCode;
            //console.log("按下键盘");
            if(e){ 
                //console.log(currKey.toString());
                keyboard.checkCommend(currKey.toString());
                switch (currKey.toString()){
                    case "27":// 按 Esc
                        console.log("按 esc");
                        if(game.running){
                            game.showMessageBox("是否退回菜单界面",function(){
                                clearInterval(game.animationInterval);
                                game.end();
                                game.hideScreens();
                                
                                game.showScreen("gamestartscreen");
                                star.stop = false;
                                star.animate();
                            },function(){
                                game.hideScreen("messageboxscreen");
                            });
                        }
                        break;
                    case "113":
                        console.log("按 f2");
                        if(game.running){
                            game.clearSelection();
                            game.selectedItems=[];
                            for(var i = 0;i<game.items.length;i++){
                                var item = game.items[i];
                                if(item.team == game.team 
                                    && (item.canAttackLand || item.canAttackAir) 
                                    && (item.type=="aircraft" || item.type=="vehicles")
                                    ){
                                        game.selectItem(item);
                                }
                            }
                        }
                        
                        break;
                    case "13":
                        console.log("按 enter");
                        break;
                    case "65":
                        //keyCode 65 = a A
                        console.log("按 a");
                        console.log(document.getElementById("gameforegroundcanvas").style.cursor);
                        if(mouse.moveAndAttack){
                            
                            mouse.moveAndAttack = false;
                            document.getElementById("gameforegroundcanvas").style.cursor = "url('images/cursor.cur'),default";
                        }else{
                            //改变光标的图片
                            document.getElementById("gameforegroundcanvas").style.cursor = "url('images/attack.png'),default";
                            mouse.moveAndAttack = true;
                        }
                        
                        break;
                    case "83":
                        //keyCode 83 = s S
                        console.log("按 s");
                        break;
                    case "32":
                        //keyCode 32 = space
                        //todo 一直按照space
                        if(game.running){
                            if(game.selectedItems.length>0){
                                console.log(game.selectItemIndex);
                                if(game.selectItemIndex!=undefined){
                                    
                                    var item = game.selectedItems[game.selectItemIndex];
                                    if(game.selectItemIndex<game.selectedItems.length-1){
                                        game.selectItemIndex++;
                                    }else if(game.selectItemIndex==game.selectedItems.length-1){
                                        game.selectItemIndex=0;
                                    }
                                    if(item.team == game.team){

                                        if((item.x*game.gridSize)-game.canvasWidth/2<0){
                                            game.offsetX =0;
                                        }else if((item.x*game.gridSize)+game.canvasWidth/2>game.currentLevel.mapGridWidth*game.gridSize){
                                            game.offsetX = game.currentLevel.mapGridWidth*game.gridSize-game.canvasWidth;
                                        }else{
                                            game.offsetX = item.x*game.gridSize-game.canvasWidth/2;
                                        }
                                        if((item.y*game.gridSize)-game.canvasHeight/2<0){
                                            game.offsetY =0;
                                        }else if((item.y*game.gridSize)+game.canvasHeight/2>game.currentLevel.mapGridHeight*game.gridSize){
                                            game.offsetY = game.currentLevel.mapGridHeight*game.gridSize-game.canvasHeight;
                                        }else{
                                            game.offsetY = item.y*game.gridSize-game.canvasHeight/2;
                                        }
                                        
                                        //允许刷新地图
                                        game.refreshBackground = true;
                                    }
                                    
                                }else{
                                    game.selectItemIndex = 0;
                                }

                            }else{
                                //选中主基地
                                for(var i = 0;i<game.items.length;i++){
                                    var item = game.items[i];
                                    if(item.team == game.team && item.name=="base"){
                                        game.selectItem(item);
                                        game.changeOffset(item);
                                        //允许刷新地图
                                        game.refreshBackground = true;
                                        return;
                                    }
                                }

                            }
                        }
                        break;
                    case "16":
                        //keyCode 16 = Shift_L
                        console.log("按 Shift_L");
                        break;
                    case "17":
                        //keyCode 17 = Control_L
                        console.log("按 Control_L");
                        break;
                    case "37":
                        //左箭头
                        //console.log("按 左箭头");
                        if(game.running){
                            if(game.offsetX>0){
                                game.refreshBackground = true;
                                game.offsetX -= game.panningSpeed*2;
                            }else{
                                game.offsetX=0;
                            }
                        }
                        break;
                    case "38":
                        //上箭头
                        //console.log("按 上箭头");
                        if(game.running){
                            if(game.offsetY>0){
                                game.refreshBackground = true;
                                game.offsetY -= game.panningSpeed*2;
                            }else{
                                game.offsetY=0;
                            }
                        }
                        break;
                    case "39":
                        //右箭头
                        //console.log("按 右箭头");
                        if(game.running){
                            if(game.offsetX+game.canvasWidth<game.currentMapImage.width){
                                game.refreshBackground = true;
                                game.offsetX += game.panningSpeed*2;
                            }else{
                                game.refreshBackground = true;
                                game.offsetX=game.currentMapImage.width-game.canvasWidth;
                            }
                        }
                        break;
                    case "40":
                        //下箭头
                        //console.log("按 下箭头");
                        if(game.running){
                            if(game.offsetY+game.canvasHeight<game.currentMapImage.height){
                                game.refreshBackground = true;
                                game.offsetY += game.panningSpeed*2;
                            }else{
                                game.refreshBackground = true;
                                game.offsetY=game.currentMapImage.height-game.canvasHeight;
                            }
                        }
                        break;
                }
            }
        }
    }
}