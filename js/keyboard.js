var keyboard = {
    init:function(){
        var body = document.body;
        document.onkeydown=function(event){
            
            var e = event || window.event || arguments.callee.caller.arguments[0];
            var currKey=e.keyCode||e.which||e.charCode;
            //console.log("按下键盘");
            if(e){ 
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
                                    if(item.selectable && !item.selected){
                                        item.selected = true;
                                        game.selectedItems.push(item);
                                    }
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
                        console.log("按 a");
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
                        console.log("按 space");
                        break;
                    case "16":
                        //keyCode 16 = Shift_L
                        console.log("按 Shift_L");
                        break;
                    case "17":
                        //keyCode 17 = Control_L
                        console.log("按 Control_L");
                        break;
                }
            }
        }
    }
}