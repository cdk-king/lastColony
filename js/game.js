// Intialize and resize the game once page has fully loaded
window.addEventListener("load", function() {
    game.resize();
    game.init();
}, false);

// Resize the game any time the window is resized
window.addEventListener("resize", function() {
    game.resize();
});

var game = {
    //开始预加载资源
    init:function(){
        loader.init();
        mouse.init();
        sidebar.init();
        sounds.init();
        star.init();

        // Display the main game menu
        game.hideScreens();
        game.showScreen("gamestartscreen");
        star.animate();
        //game.initBackground();
        //game.changeStartBackground();
        // Initialize and store contexts for both the canvases
        game.initCanvases();

    },
    backgroundIndex:0,
    backgroundCount:3,
    backgrounds:[],
    initBackground:function(){
        for(var i = 0;i<game.backgroundCount;i++){
            //game.backgroundIndex = i;
            var image = loader.loadImage("images/screens/splashscreen"+(i+1)+".png");
            image.callback = function() {
                this.scale = this.width/this.height;
                //console.log(this.scale);
                //console.log(this.src);
            }
            
            game.backgrounds.push(image);
        }
        loader.onload = true;
    },
    changeStartBackground:function(){
        game.changeStartBackgroundInterval = setInterval(function(){
            console.log(game.backgroundIndex);
            game.backgroundIndex++;
            if(game.backgroundIndex>=3){
                game.backgroundIndex = 0;
            }
            console.log(game.backgrounds);
            console.log(game.backgroundIndex);
            var gameContainer = document.getElementById("gamecontainer");
            var scale = game.backgrounds[game.backgroundIndex].scale;
            var gameScale = gameContainer.clientWidth/gameContainer.clientHeight;
            console.log(scale);
            console.log(gameScale);
            
            document.getElementById("gamecontainer").style.background="url(images/screens/splashscreen"+(game.backgroundIndex+1)+".png) no-repeat";
            if(scale>gameScale){
                //第一个值设置宽度，第二个值设置高度
                document.getElementById("gamecontainer").style.backgroundSize="auto 100%";
            }else{
                document.getElementById("gamecontainer").style.backgroundSize="100% auto";
            }
        },10000);
    },
    scale: 1,
    resize: function() {

        var maxWidth = window.innerWidth;
        var maxHeight = window.innerHeight;

        var scale = Math.min(maxWidth / 640, maxHeight / 480);

        var gameContainer = document.getElementById("gamecontainer");

        gameContainer.style.transform = "translate(-50%, -50%) " + "scale(" + scale + ")";

        game.scale = scale;

        // What is the maximum width we can set based on the current scale
        // Clamp the value between 640 and 1024
        var width = Math.max(640, Math.min(1024, maxWidth / scale ));

        // Apply this new width to game container and game canvas
        gameContainer.style.width = width + "px";

        // Subtract 160px for the sidebar
        var canvasWidth = width - 160;

        // Set a flag in case the canvas was resized
        if (game.canvasWidth !== canvasWidth) {
            game.canvasWidth = canvasWidth;
            game.canvasResized = true;
            game.refreshBackground = true;
        }

    },
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

        // Clear the game messages area
        let gamemessages = document.getElementById("gamemessages");

        gamemessages.innerHTML = "";

        // Initialize All Game Triggers
        game.currentLevel.triggers.forEach(function(trigger) {
            game.initTrigger(trigger);
        });
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
        //显示侧边栏
        sidebar.animate();

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

        fog.animate();

        //保存最后一次动画循环完成的时间
        game.lastAnimationTime = (new Date()).getTime();

    },
    drawingLoop:function(){
        
        //处理地图平移
        game.handlePanning();

        //检查距离上一次动画循环时间并计算出一个线性插值量（-1~0）
        //绘制比动画发生得更频繁
        game.lastDrawTime = (new Date()).getTime();
        if(game.lastAnimationTime){
            game.drawingInterpolationFactor = (game.lastDrawTime-game.lastAnimationTime)/game.animationTimeout-1;//animationTimeout100
            
            if(game.drawingInterpolationFactor>0){
                //下一个动画循环之外无点插值
                game.drawingInterpolationFactor = 0;
            }
        }
        else{
            game.drawingInterpolationFactor = -1;
        }
        //绘制背景地图是一项庞大的工作，我们仅在地图改变平移时重新绘制
        if(game.refreshBackground){
            if (game.canvasResized) {
                game.backgroundCanvas.width = game.canvasWidth;
                game.foregroundCanvas.width = game.canvasWidth;

                // Ensure the resizing doesn't cause the map to pan out of bounds
                if (game.offsetX + game.canvasWidth > game.currentMapImage.width) {
                    game.offsetX = game.currentMapImage.width - game.canvasWidth;
                }

                if (game.offsetY + game.canvasHeight > game.currentMapImage.height) {
                    game.offsetY = game.currentMapImage.height - game.canvasHeight;
                }

                game.canvasResized = false;
            }
            game.backgroundContext.drawImage(game.currentMapImage,game.offsetX,game.offsetY,
            game.canvasWidth,game.canvasHeight,0,0,game.canvasWidth,game.canvasHeight);
            game.refreshBackground = false;
        }

        //清空前景
        game.foregroundContext.clearRect(0,0,game.canvasWidth,game.canvasHeight);

        //开始绘制前景元素
        //深度排序确保近的物体遮挡远的物体
        for(var i = 0;i<=game.sortedItems.length-1;i++){
            if(game.sortedItems[i].type!="bullets"){
                game.sortedItems[i].draw();
            }
        }
        // game.sortedItems.forEach(function(item) {
        //     item.draw();
        // });

        //在其他所有的物体上方绘制炮群
        for(var i = 0;i<=game.bullets.length-1;i++){
            game.bullets[i].draw();
        };

        //绘制战争迷雾
        fog.draw();

        littleMap.draw();

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
        game.bullets = [];
    },
    add:function(itemDetails){
        //为每个单位项设置唯一的id
        if(!itemDetails.uid){   
            itemDetails.uid = ++game.counter;
        }
        var item = window[itemDetails.type].add(itemDetails);
        //将单位项加入items数组
        game.items.push(item);
        //将单位项加入指定的单位类型数组
        game[item.type].push(item);

        if(item.type =="buildings" || item.type == "terrain"){
            game.currentMapPassableGrid = undefined;
        }

        if(item.type == "bullets"){
            sounds.play(item.name);
        }

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

        if(item.type =="buildings" || item.type == "terrain"){
            game.currentMapPassableGrid = undefined;
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
            toObject = game.getItemByUid(details.toUid);
            if(!toObject || toObject.lifeCode === "dead"){
                //toObject不存在，无效的命令
                console.log("toObject不存在，无效的命令");
                console.log(details.toUid);
                console.log(toObject);
                console.log(game.items);
                return;
            }
        }
        //注意区别for( a in b )
        for(var i in uids){
            var uid = uids[i];
            //console.log(uid);
            var item = game.getItemByUid(uid);
            //如果uid是合法的单位，则为该单位设置命令
            if(item){
                
                item.orders = Object.assign({}, details);
                //console.log(item);
                //console.log(item.orders);
                if(toObject){
                    item.orders.to = toObject;
                }
            }
            //console.log(item.orders);
        }
        
    },
    /* Movement related properties */
    speedAdjustmentFactor: 1 / 64,
    turnSpeedAdjustmentFactor: 1 / 8,
    // Make a copy of a 2 Dimensional Array
    makeArrayCopy: function(originalArray) {
        var length = originalArray.length;
        var copy = new Array(length);

        for (let i = 0; i < length; i++) {
            copy[i] = originalArray[i].slice(0);
        }

        return copy;
    },
    rebuildPassableGrid: function() {

        // Initialize Passable Grid with the value of Terrain Grid
        game.currentMapPassableGrid = game.makeArrayCopy(game.currentMapTerrainGrid);

        // Also mark all building and terrain as unpassable items
        for (let i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];

            if (item.type === "buildings" || item.type === "terrain") {
                for (let y = item.passableGrid.length - 1; y >= 0; y--) {
                    for (let x = item.passableGrid[y].length - 1; x >= 0; x--) {
                        if (item.passableGrid[y][x]) {
                            game.currentMapPassableGrid[item.y + y][item.x + x] = 1;
                        }
                    }
                }
            }
        }
        //console.log( game.currentMapPassableGrid[3][5]);
    },
    rebuildBuildableGrid:function(){
        game.currentMapPassableGrid = game.makeArrayCopy(game.currentMapTerrainGrid);

        // Also mark all building and terrain as unpassable items
        for (let i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];

            if (item.type === "buildings" || item.type === "terrain") {
                for (let y = item.passableGrid.length - 1; y >= 0; y--) {
                    for (let x = item.passableGrid[y].length - 1; x >= 0; x--) {
                        if (item.passableGrid[y][x]) {
                            game.currentMapPassableGrid[item.y + y][item.x + x] = 1;
                        }
                    }
                }
            }else if(item.type == "vehicles"){
                //将车辆下方及附近的网格设置为“不可建造”
                var radius = item.radius/game.gridSize;
                var x1 = Math.max(Math.floor(item.x-radius),0);
                var x2 = Math.min(Math.floor(item.x+radius),game.currentLevel.mapGridWidth-1);
                var y1 = Math.max(Math.floor(item.y-radius),0);
                var y2 = Math.min(Math.floor(item.y+radius),game.currentLevel.mapGridHeight-1);

                for (var x = x1; x <= x2; x++) {
                    for (var y = y1; y <= y2; y++) {
                        
                        game.currentMapPassableGrid[y][x] = 1;
                    }
                }
            }
        }
    },
    //与玩家交互的函数
    characters:{
        "system":{
            "name":"System",
            "image":"images/characters/system.png",
        },
        "操作员":{//操作员
            "name":"操作员",
            "image":"images/characters/girl1.png",
        },
        "飞行员":{//飞行员
            "name":"飞行员",
            "image":"images/characters/girl2.png",
        },
        "驾驶员":{//驾驶员
            "name":"驾驶员",
            "image":"images/characters/man1.png",
        },
    },
    showMessage:function(from,message){
        sounds.play("message-received");
        var character = game.characters[from];
        if(character){
            from = character.name;
            if(character.image){
                document.getElementById("callerpicture").innerHTML = '<img src="'+character.image+'" class="characters"/>';
                //6秒后隐藏个人资料
                setTimeout(function(){
                    document.getElementById("callerpicture").innerHTML = "";
                },6000);
            }
        }
        //为消息板添加消息，并滚动到底部
        let gamemessages = document.getElementById("gamemessages");
        let messageHTML = "<span>" + from + ": </span>" + message + "<br>";

        gamemessages.innerHTML += messageHTML;
        gamemessages.scrollTop = gamemessages.scrollHeight;
    },
    /* 与消息框相关的代码 */
    messageBoxOkCallback:undefined,
    messageBoxCancelCallback:undefined,
    showMessageBox:function(message,onOk,onCancel){
        //设置消息框文本
        let messageBoxText = document.getElementById("messageboxtext");
        messageBoxText.style.display = ""; 
        messageBoxText.innerHTML = message.replace(/\n/g, "<br><br>");

        //设置消息框ok和cancel按钮处理函数，启用按钮
        if(!onOk){
            game.messageBoxOkCallback = undefined;
        }else{
            game.messageBoxOkCallback = onOk;
        }

        let cancelButton = document.getElementById("messageboxcancel");

        if(!onCancel){
            game.messageBoxCancelCallback = undefined;
            cancelButton.style.display = "none";
        }else{
            game.messageBoxCancelCallback = onCancel;
            // Hide the cancel button
            cancelButton.style.display = "";
        }
        //显示消息框并等待用户响应
        game.showScreen("messageboxscreen");
    },
    messageBoxOK:function(){
        let messageBoxText = document.getElementById("messageboxtext");
        messageBoxText.style.display = "none";

        if(game.messageBoxOkCallback){
            game.messageBoxOkCallback();
        }
    },
    messageBoxCancel:function(){
        let messageBoxText = document.getElementById("messageboxtext");
        messageBoxText.style.display = "none";

        if(game.messageBoxCancelCallback){
            game.messageBoxCancelCallback();
        }
    },
    //游戏中处理触发器事件的方法
    initTrigger:function(trigger){
        if(trigger.type == "timed"){
            trigger.timeout = setTimeout(function(){
                game.runTrigger(trigger);
            },trigger.time);
        }else if(trigger.type == "conditional"){
            trigger.interval = setInterval(function(){
                game.runTrigger(trigger);
            },1000);
        }
    },
    runTrigger:function(trigger){
        if(trigger.type == "timed"){
            //基于触发器是否重复调用，重新初始化触发器
            if(trigger.repeat){
                game.initTrigger(trigger);
            }
            //调用触发器动作
            trigger.action(trigger);
        }else if(trigger.type == "conditional"){
            //检查条件是否满足
            if(trigger.condition()){
                //清除触发器
                game.clearTrigger(trigger);
                //调用触发器动作
                trigger.action(trigger);
            }
        }
    },
    clearTrigger:function(trigger){
        if(trigger.type == "timed"){
            clearTimeout(trigger.timeout);
        }else if(trigger.type == "conditional"){
            clearInterval(trigger.interval);
        }
    },
    end:function(){
        //清除游戏中所有的触发器
        if(game.currentLevel.triggers){
            for(var i = game.currentLevel.triggers.length-1;i>=0;i--){
                game.clearTrigger(game.currentLevel.triggers[i]);
            };
        }
        game.running = false;
    }
}