var singleplayer = {
    //开始单人战役
    start:function(){
        //隐藏开始菜单图层
        game.hideScreens();

        //从第一关开始
        singleplayer.currentLevel = 0;
        game.type = "singleplayer";
        game.team = "blue";

        //最后，开始关卡
        singleplayer.startCurrentLevel();
    },
    exit:function(){
        //显示开始菜单
        game.hideScreens();
        game.showScreen("gamestartscreen");
    },
    currentLevel: 0,
    startCurrentLevel:function(){
        //获取用来构建关卡的数据
        var level = maps.singleplayer[singleplayer.currentLevel];

        //加载资源完成之前，禁用“开始任务”按钮
        var enterMissionButton = document.getElementById("entermission");

        enterMissionButton.disabled = true;

        //加载用来创建关卡的资源
        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentLevel = level;

        game.offsetX = level.startX * game.gridSize;
        game.offsetY = level.startY * game.gridSize;

        //加载资源完成后，启动“开始任务“按钮
        if(loader.loaded){
            enterMissionButton.disabled = false;
        }else{
            loader.onload = function(){
                enterMissionButton.disabled = false;
            }
        }

        //加载任务简介画面
        this.showMissionBriefing(level.briefing);
    },
    showMissionBriefing: function(briefing) {
        var missionBriefingText = document.getElementById("missionbriefing");

        // Replace \n in briefing text with two <br> to create next paragraph
        missionBriefingText.innerHTML = briefing.replace(/\n/g, "<br><br>");

        // Display the mission briefing screen
        game.showScreen("missionscreen");
    },
    play: function() {
        // Run the animation loop once
        game.animationLoop();

        // Start the animation loop interval
        game.animationInterval = setInterval(game.animationLoop, game.animationTimeout);

        game.start();
    },
}