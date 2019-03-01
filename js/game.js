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
    animationLoop:function(){
        //
    },
    drawingLoop:function(){
        
        //console.log(game.offsetX);

        //处理地图平移
        //绘制背景地图是一项庞大的工作，我们仅在地图改变平移时重新绘制
        if(game.refreshBackground){
            game.backgroundContext.drawImage(game.currentMapImage,game.offsetX,game.offsetY,
            game.canvasWidth,game.canvasHeight,0,0,game.canvasWidth,game.canvasHeight);
            game.refreshBackground = false;
        }

        //清空前景
        game.foregroundContext.clearRect(0,0,game.canvasWidth,game.canvasHeight);


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
}