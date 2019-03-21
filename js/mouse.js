var mouse = {
    //鼠标相对于canvas左上角的x，y坐标
    x:0,
    y:0,
    //鼠标相对于游戏地图左上角的x,y坐标
    gameX:0,
    gameY:0,
    //鼠标在游戏网格中的x,y坐标
    gridX:0,
    gridY:0,
    //鼠标左键当前是否被按下
    buttonPressed:false,
    //玩家是否按下鼠标左键并进行拖拽
    dragSelect:false,
    // 如果拖动的鼠标超过此值，则假定玩家正在尝试选择
    dragSelectThreshold: 5,
    //鼠标是否在canvas区域
    insideCanvas:false,
    //移动攻击指令
    moveAndAttack:false, 

    click:function(ev,rightClick){
        //玩家在canvas内单机鼠标
    },
    draw:function(){
        if(this.dragSelect){
            var x = Math.min(this.gameX,this.dragX);
            var y = Math.min(this.gameY,this.dragY);
            var width = Math.abs(this.gameX-this.dragX);
            var height = Math.abs(this.gameY-this.dragY);
            game.foregroundContext.strokeStyle = "white";
            game.foregroundContext.strokeRect(x-game.offsetX,y-game.offsetY,width,height);

        }
        if(game.deployBuilding && game.placementGrid){
            var buildingType = buildings.list[game.deployBuilding];
            var x = (this.gridX * game.gridSize) - game.offsetX;
            var y = (this.gridY * game.gridSize) - game.offsetY;
            for(var i = game.placementGrid.length-1;i>=0;i--){
                for(var j = game.placementGrid[i].length-1;j>=0;j--){
                    if(game.placementGrid[i][j]){
                        game.foregroundContext.fillStyle = "rgba(0,0,255,0.3)";
                    }else{
                        game.foregroundContext.fillStyle = "rgba(255,0,0,0.3)";
                    }
                    game.foregroundContext.fillRect(x+j*game.gridSize,y+i*game.gridSize,game.gridSize,game.gridSize);
                }
            }
        }
    },
    calculateGameCoordinates:function(){
        mouse.gameX = mouse.x + game.offsetX;
        mouse.gameY = mouse.y + game.offsetY;
        
        mouse.gridX = Math.floor(mouse.gameX / game.gridSize);
        mouse.gridY = Math.floor(mouse.gameY / game.gridSize);
        // console.log(mouse.x);
        // console.log(game.offsetX);
        // console.log(mouse.x + game.offsetX);
        // console.log(game.gridSize);
        // console.log(mouse.gameX);
        // console.log(game.gameX / game.gridSize);
        // console.log(mouse.gameX);
        // console.log(mouse.gridX);
    },
    init:function(){
        let canvas = document.getElementById("gameforegroundcanvas");
        //console.log("cdk");
        canvas.addEventListener("mousemove", mouse.mousemovehandler, false);

        canvas.addEventListener("mouseenter", mouse.mouseenterhandler, false);
        canvas.addEventListener("mouseout", mouse.mouseouthandler, false);

        canvas.addEventListener("mousedown", mouse.mousedownhandler, false);
        canvas.addEventListener("mouseup", mouse.mouseuphandler, false);

        canvas.addEventListener("contextmenu", mouse.mouserightclickhandler, false);

        mouse.canvas = canvas;
    },
    mouserightclickhandler: function(ev) {
        mouse.rightClick();

        // Prevent the browser from showing the context menu
        ev.preventDefault(true);
    },
    rightClick:function(){
        //如果游戏处于建造模式
        if(game.deployBuilding){
            sidebar.cancelDeployingBuilding()
            return;
        }

        if(mouse.moveAndAttack){
            mouse.moveAndAttack = false;
            document.getElementById("gameforegroundcanvas").style.cursor = "url('images/cursor.cur'),default";
        }

        var uids = [];
        let clickedItem = mouse.itemUnderMouse();
        if(clickedItem){
            if(clickedItem.type != "terrain"){
                if(clickedItem.team != game.team){
                    //从选中的单位中挑出具备攻击能力的单位
                    for(var i = game.selectedItems.length-1;i>=0;i--){
                        var item = game.selectedItems[i];
                        if(item.team == game.team && item.canAttack){
                            uids.push(item.uid);
                        }
                    };
                    //接着命令它们攻击被右击的单位
                    if(uids.length>0){
                        game.sendCommand(uids,{type:"attack",toUid:clickedItem.uid});
                        sounds.play("acknowledge-attacking");
                    }

                }else{
                    //玩家右击友方单位
                    //从选中的单位中挑出能移动的
                    for(var i = game.selectedItems.length-1;i>=0;i--){
                        var item = game.selectedItems[i];
                        if(item.team == game.team && (item.type ==="vehicles" || item.type === "aircraft")){
                            uids.push(item.uid);
                        }
                    };
                    //接着命令它们守卫被右击的单位
                    if(uids.length>0){
                        game.sendCommand(uids,{type:"guard",toUid:clickedItem.uid});
                        sounds.play("acknowledge-moving");
                    }
                }
            }else if(clickedItem.name == "oilfield"){
                //右击一块油田
                console.log("玩家右击油田");
                //从选中的单位中挑出第一辆采油车
                for(var i = game.selectedItems.length-1;i>=0;i--){
                    var item = game.selectedItems[i];
                    if(item.team == game.team && (item.type ==="vehicles" && item.name === "harvester")){
                        uids.push(item.uid);
                        break;//确保一个
                    }
                };
                //接着命令它在油田上展开
                if(uids.length>0){
                    game.sendCommand(uids,{type:"deploy",toUid:clickedItem.uid});
                    sounds.play("acknowledge-moving");
                }

            }
        }else{
            console.log("玩家右击地面");
            //玩家右击地面
            //从队伍中挑出能够移动的单位
            for(var i = game.selectedItems.length-1;i>=0;i--){
                var item = game.selectedItems[i];
                if(item.team == game.team && (item.type ==="vehicles" || item.type === "aircraft")){
                    uids.push(item.uid);
                }
            };
            //console.log("uids:"+uids);
            //接着命令它们移动到右击的位置
            if(uids.length>0){
                game.sendCommand(uids,{type:"move",to:{
                    x:mouse.gameX/game.gridSize,
                    y:mouse.gameY/game.gridSize
                }});
                sounds.play("acknowledge-moving");
            }
        }
    },
    mousemovehandler:function(ev){
        mouse.insideCanvas = true;

        mouse.setCoordinates(ev.clientX, ev.clientY);
        mouse.checkIfDragging();
    },
    setCoordinates:function(clientX, clientY) {
        let offset = mouse.canvas.getBoundingClientRect();
        //body可视区域clientX
        //body全部区域pageX
        mouse.x = (clientX - offset.left) / game.scale;
        mouse.y = (clientY - offset.top) / game.scale;

        mouse.calculateGameCoordinates();
    },
    checkIfDragging: function() {
        if (mouse.buttonPressed) {
            // If the mouse has been dragged more than threshold treat it as a drag
            if ((Math.abs(mouse.dragX - mouse.gameX) > mouse.dragSelectThreshold && Math.abs(mouse.dragY - mouse.gameY) > mouse.dragSelectThreshold)) {
                mouse.dragSelect = true;
            }
        } else {
            mouse.dragSelect = false;
        }
    },
    mouseenterhandler:function(ev){
        //mouse.buttonPressed = false;
        mouse.insideCanvas = true;
    },
    mouseouthandler:function(ev){
        mouse.insideCanvas = false;
    },
    mousedownhandler: function(ev) {
        mouse.insideCanvas = true;
        mouse.setCoordinates(ev.clientX, ev.clientY);

        if (ev.button === 0) { // Left mouse button was pressed
            mouse.buttonPressed = true;

            mouse.dragX = mouse.gameX;
            mouse.dragY = mouse.gameY;
            // console.log(mouse.dragX);
            // console.log(mouse.dragY);

            ev.preventDefault();
        }
    },
    mouseuphandler: function(ev) {
        mouse.setCoordinates(ev.clientX, ev.clientY);

        let shiftPressed = ev.shiftKey;

        if (ev.button === 0) { // Left mouse button was released
            if (mouse.dragSelect) {
                // If currently drag-selecting, attempt to select items with the selection rectangle
                mouse.finishDragSelection(shiftPressed);
            } else {
                // If not dragging, treat this as a normal click once the mouse is released
                mouse.leftClick(shiftPressed);
            }
            mouse.dragSelect = false;
            mouse.buttonPressed = false;

            // ev.preventDefault();
        }
    },
    finishDragSelection: function(shiftPressed) {
        if (!shiftPressed) {
            // If shift key is not pressed, clear any previosly selected items
            //没有按住shift键
            game.clearSelection();
        }

        // Calculate the bounds of the selection rectangle
        let x1 = Math.min(mouse.gameX, mouse.dragX);
        let y1 = Math.min(mouse.gameY, mouse.dragY);
        let x2 = Math.max(mouse.gameX, mouse.dragX);
        let y2 = Math.max(mouse.gameY, mouse.dragY);

        game.items.forEach(function(item) {
            // Unselectable items, dead items, opponent team items and buildings are not drag-selectable
            if (!item.selectable || item.lifeCode === "dead" || item.team !== game.team || item.type === "buildings") {
                return;
            }

            let x = item.x * game.gridSize;
            let y = item.y * game.gridSize;

            if (x1 <= x && x2 >= x) {
                if ((item.type === "vehicles" && y1 <= y && y2 >= y)
                    // In case of aircraft, adjust for pixelShadowHeight
                    || (item.type === "aircraft" && (y1 <= y - item.pixelShadowHeight) && (y2 >= y - item.pixelShadowHeight))) {

                    game.selectItem(item, shiftPressed);
                }
            }
        });
        mouse.dragSelect = false;
    },
    // Called whenever player completes a left click on the game canvas
    leftClick: function(shiftPressed) {

        //如果游戏处于建造模式
        if(game.deployBuilding){
            if(game.canDeployBuilding){
                sidebar.finishDeployingBuilding();
            }else{
                game.showMessage("system","警告！无法在此处部署建筑。");
            }
            return;
        }

        if(mouse.moveAndAttack){
            //设置鼠标样式
            document.getElementById("gameforegroundcanvas").style.cursor = "url('images/cursor.cur'),default";
            mouse.moveAndAttack = false;
            var uids = [];
            if(game.selectedItems.length>0){
                let clickedItem = mouse.itemUnderMouse();
                //console.log(clickedItem);
                if (clickedItem) {
                    //从选中的单位中挑出具备攻击能力的单位
                    for(var i = game.selectedItems.length-1;i>=0;i--){
                        var item = game.selectedItems[i];
                        if(item.team == game.team && item.canAttack){
                            uids.push(item.uid);
                        }
                    };
                    //接着命令它们攻击被右击的单位
                    if(uids.length>0){
                        game.sendCommand(uids,{type:"attack",toUid:clickedItem.uid});
                        sounds.play("acknowledge-attacking");
                    }
                }else{
                    
                    //从队伍中挑出能够移动的单位
                    for(var i = game.selectedItems.length-1;i>=0;i--){
                        var item = game.selectedItems[i];
                        if(item.team == game.team && (item.type ==="vehicles" || item.type === "aircraft")){
                            uids.push(item.uid);
                        }
                    };
                    //console.log("uids:"+uids);
                    //接着命令它们移动到右击的位置
                    if(uids.length>0){
                        game.sendCommand(uids,{type:"moveAndAttack",to:{
                            x:mouse.gameX/game.gridSize,
                            y:mouse.gameY/game.gridSize
                        }});
                        sounds.play("acknowledge-moving");
                    }
                } 
            }
            return;
        }

        let clickedItem = mouse.itemUnderMouse();
        //console.log(clickedItem);
        if (clickedItem) {
            
            // Pressing shift adds to existing selection. If shift is not pressed, clear existing selection
            if (!shiftPressed) {
                game.clearSelection();
            }

            game.selectItem(clickedItem, shiftPressed);
            
            
            
        }
        
        console.log(clickedItem);
    },
    itemUnderMouse:function(){
        //console.log(mouse.gameX);
        if(fog.isPointOverFog(mouse.gameX,mouse.gameY)){
            console.log("目标在阴影，无法点击");
            return;
        }
        for(var i = game.items.length-1;i>=0;i--){
            var item = game.items[i];
            if(item.type == "buildings" || item.type == "terrain"){
                if(item.lifeCode != "dead" 
                && item.x<=(mouse.gameX)/game.gridSize
                && item.x>=(mouse.gameX - item.baseWidth)/game.gridSize
                && item.y<=(mouse.gameY)/game.gridSize
                && item.y>=(mouse.gameY - item.baseHeight)/game.gridSize
                ){
                    return item;
                }
            }else if(item.type == "aircraft"){
                if(item.lifeCode != "dead" 
                && Math.pow(item.x-mouse.gameX/game.gridSize,2) + Math.pow(item.y-(mouse.gameY+item.pixelShadowHeight)/game.gridSize,2)
                <Math.pow((item.radius)/game.gridSize,2)
                ){
                    return item;
                }
            }else{
                if(item.lifeCode != "dead"
                && Math.pow(item.x-mouse.gameX/game.gridSize,2) + Math.pow(item.y-mouse.gameY/game.gridSize,2)
                <Math.pow((item.radius)/game.gridSize,2)
                ){
                    return item;
                }
            }
        }
    }
    
}