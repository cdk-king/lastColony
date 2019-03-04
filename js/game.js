// Intialize and resize the game once page has fully loaded
window.addEventListener("load", function() {
    //game.resize();
    game.init();
}, false);

// Resize the game any time the window is resized
window.addEventListener("resize", function() {
    //game.resize();
});

var game = {
    //开始预加载资源
    init:function(){
        loader.init();
        mouse.init();
        // Display the main game menu
        game.hideScreens();
        game.showScreen("gamestartscreen");

        // Initialize and store contexts for both the canvases
        game.initCanvases();

    },
    scale: 1,
    canvasWidth: 480,
    canvasHeight: 400,
    initCanvases:function(){
        game.backgroundCanvas = document.getElementById("gamebackgroundcanvas");
        game.backgroundContext = game.backgroundCanvas.getContext("2d");

        game.foregroundCanvas = document.getElementById("gameforegroundcanvas");
        game.foregroundContext = game.foregroundCanvas.getContext("2d");

        game.foregroundCanvas.width = game.canvasWidth;
        game.backgroundCanvas.width = game.canvasWidth;

        game.foregroundCanvas.height = game.canvasHeight;
        game.backgroundCanvas.height = game.canvasHeight;
    },
    start:function(){
        // Display the game interface
        game.hideScreens();
        game.showScreen("gameinterfacescreen");

        game.running = true;
        game.refreshBackground = true;

        game.drawingLoop();
    },
    //地图被分割成20像素*20像素的方向网格
    gridSize:20,

    //记录背景是否移动，是否需要被重绘
    backgroundChanged:true,

    //控制循环，运行固定的时间
    animationTimeout:100,   //100毫秒，

    //地图平移偏移量
    offsetX:0,
    offsetY:0,
    //与canvas边缘的距离，在此距离范围内拖拽鼠标进行地图平移
    panningThreshold:60,
    //每个绘图循环平移的速度
    panningSpeed:10,
    handlePanning:function(){
        //如果鼠标离开canvas，地图不会平移
        if(!mouse.insideCanvas){
            return;
        }
        
        if(mouse.x<=game.panningThreshold){
            if(game.offsetX>=game.panningSpeed){
                game.refreshBackground = true;
                game.offsetX -= game.panningSpeed;
            }
        }else if(mouse.x>=game.canvasWidth-game.panningThreshold){
            if(game.offsetX+game.canvasWidth+game.panningSpeed<=game.currentMapImage.width){
                game.refreshBackground = true;
                game.offsetX += game.panningSpeed;
            }
        }

        if(mouse.y<=game.panningThreshold){
            if(game.offsetY>=game.panningSpeed){
                game.refreshBackground = true;
                game.offsetY -= game.panningSpeed;
            }
        }else if(mouse.y>=game.canvasHeight-game.panningThreshold){
            if(game.offsetY+game.canvasHeight+game.panningSpeed<=game.currentMapImage.height){
                game.refreshBackground = true;
                game.offsetY += game.panningSpeed;
            }
        }

        if(game.refreshBackground){
            //基于平移偏移量，更新鼠标坐标
            mouse.calculateGameCoordinates();
        }
    },
    animationLoop:function(){
        //使所有指定了命令的单位执行命令
        for(var i = game.items.length-1;i>=0;i--){
            if(game.items[i].processOrders){
                game.items[i].processOrders();
            }
        }

        //生成游戏中每个单位的动画循环
        for(var i = game.items.length-1;i>=0;i--){
            game.items[i].animate();
        }

        //基于x和y坐标对游戏中所有的单位项排序为sortedItems数组
        game.sortedItems = Object.assign([],game.items);
        game.sortedItems.sort(function(a, b) {
            return a.y - b.y + ((a.y === b.y) ? (b.x - a.x) : 0);
        });



    },
    drawingLoop:function(){
        
        //处理地图平移
        game.handlePanning();

        //处理地图平移
        //绘制背景地图是一项庞大的工作，我们仅在地图改变平移时重新绘制
        if(game.refreshBackground){
            game.backgroundContext.drawImage(game.currentMapImage,game.offsetX,game.offsetY,
            game.canvasWidth,game.canvasHeight,0,0,game.canvasWidth,game.canvasHeight);
            game.refreshBackground = false;
        }

        //清空前景
        game.foregroundContext.clearRect(0,0,game.canvasWidth,game.canvasHeight);

        //开始绘制前景元素
        //深度排序确保近的物体遮挡远的物体
        for(var i = 0;i<=game.sortedItems.length-1;i++){
            game.sortedItems[i].draw();
        }
        // game.sortedItems.forEach(function(item) {
        //     item.draw();
        // });

        //绘制鼠标
        mouse.draw();

        //使用requestAnimationFrame调用下一次绘图循环
        if(game.running){
            requestAnimationFrame(game.drawingLoop);
        }
    },
    hideScreens: function() {
        var screens = document.getElementsByClassName("gamelayer");
        for (let i = screens.length - 1; i >= 0; i--) {
            var screen = screens[i];
            screen.style.display = "none";
        }
    },
    hideScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "none";
    },
    showScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "block";
    },
    resetArrays: function() {
        // Count items added in game, to assign them a unique id
        game.counter = 1;

        // Track all the items currently in the game
        game.items = [];
        game.buildings = [];
        game.vehicles = [];
        game.aircraft = [];
        game.terrain = [];

        // Track items that have been selected by the player
        game.selectedItems = [];

        game.triggeredEvents = [];
        game.sortedItems = [];
    },
    add:function(itemDetails){
        //为每个单位项设置唯一的id
        if(!itemDetails.uid){
            itemDetails.uid = game.counter++;
        }
        var item = window[itemDetails.type].add(itemDetails);
        //将单位项加入items数组
        game.items.push(item);
        //将单位项加入指定的单位类型数组
        game[item.type].push(item);
        return item;
    },
    remove:function(item){
        //如果已经选中该单位，解除选中
        item.selected = false;
        for(var i = game.selectedItems.length-1;i>=0;i--){
            if(game.selectedItems[i].uid == item.uid){
                game.selectedItems.splice(i,1);
                break;
            }
        }

        //从items数组中移除该单位
        for(var i = game.items.length-1;i>=0;i--){
            if(game.items[i].uid == item.uid){
                game.items.splice(i,1);
                break;
            }
        }

        //从指定的单位类型数组中移除该单位
        for(var i = game[item.type].length-1;i>=0;i--){
            if(game[item.type][i].uid == item.uid){
                game[item.type].splice(i,1);
                break;
            }
        }
    },
    selectionBorderColor:"rgba(255,255,0,0.5)",
    selectionFillColor:"rgba(255,215,0,0.2)",
    healthBarBorderColor:"rgba(0,0,0,0.8)",
    healthBarHealthyFillColor:"rgba(0,255,0,0.5)",
    healthBarDamagedFillColor:"rgba(255,0,0,0.5)",
    lifeBarHeight:5,
    clearSelection:function(){
        while(game.selectedItems.length>0){
            //pop() 方法用于删除并返回数组的最后一个元素。
            game.selectedItems.pop().selected = false;
        }
    },
    selectItem:function(item,shiftPressed){
        //按住Shift键并单击已选中的单位会从选择集中取消选中
        if(shiftPressed && item.selected){
            //取消选中单位
            item.selected = false;
            for(var i = game.selectedItems.length-1;i<=0;i--){
                if(game.selectedItems[i].uid == item.uid){
                    game.selectedItems.splice(i,1);
                    break;
                }
            }
            return;
        }

        if(item.selectable && !item.selected){
            item.selected = true;
            game.selectedItems.push(item);
        }
    },
    sendCommand:function(uids,details){
        if(game.type == "singleplayer"){
            singleplayer.sendCommand(uids,details);
        }else{
            multiplayer.sendCommand(uids,details);
        }
    },
    getItemByUid:function(uid){
        for(var i = game.items.length-1;i>=0;i--){
            if(game.items[i].uid==uid){
                return game.items[i];
            }
        };
    },
    processCommand:function(uids,details){
        //如果时uid类型，那么获取对应的目标对象
        var toObject;
        if(details.toUid){
            toObjectc = game.getItemByUid(details.toUid);
            if(!toObject || toObject.lifeCode == "dead"){
                //toObject不存在，无效的命令
                return;
            }
        }
        //注意区别for( a in b )
        for(var i in uids){
            var uid = uids[i];
            var item = game.getItemByUid(uid);
            //如果uid是合法的单位，则为该单位设置命令
            if(item){
                item.orders = Object.assign({}, details);
                if(toObject){
                    item.orders.to = toObject;
                }
            }
        }

    }
}