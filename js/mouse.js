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
    },
    calculateGameCoordinates:function(){
        mouse.gameX = mouse.x + game.offsetX;
        mouse.gameY = mouse.y + game.offsetY;
        
        mouse.gridX = Math.floor(game.gameX / game.gridSize);
        mouse.gridY = Math.floor(game.gameY / game.gridSize);
    },
    init:function(){
        let canvas = document.getElementById("gameforegroundcanvas");
        console.log("cdk");
        canvas.addEventListener("mousemove", mouse.mousemovehandler, false);

        canvas.addEventListener("mouseenter", mouse.mouseenterhandler, false);
        canvas.addEventListener("mouseout", mouse.mouseouthandler, false);

        canvas.addEventListener("mousedown", mouse.mousedownhandler, false);
        canvas.addEventListener("mouseup", mouse.mouseuphandler, false);

        mouse.canvas = canvas;
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
                //mouse.finishDragSelection(shiftPressed);
            } else {
                // If not dragging, treat this as a normal click once the mouse is released
                //mouse.leftClick(shiftPressed);
            }
            mouse.dragSelect = false;
            mouse.buttonPressed = false;

            // ev.preventDefault();
        }
    },
    
}