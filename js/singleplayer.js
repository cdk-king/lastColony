var singleplayer = {
    //开始单人战役
    start:function(){
        star.stop = true;
        //隐藏开始菜单图层
        game.hideScreens();

        //从第一关开始
        singleplayer.currentLevel = 0;
        
        singleplayer.isCourse = false;
        game.type = "singleplayer";
        game.team = "blue";

        //最后，开始关卡
        singleplayer.startCurrentLevel();
    },
    startCourse:function(){
        star.stop = true;
        //隐藏开始菜单图层
        game.hideScreens();
        //从第一关开始
        singleplayer.courseCurrentLevel = 4;
        singleplayer.isCourse = true;
        game.type = "singleplayer";
        game.team = "blue";
        //最后，开始关卡
        singleplayer.startCurrentLevel();
    },
    exit:function(){
        star.stop = false;
        star.animate();
        //显示开始菜单
        game.hideScreens();
        game.showScreen("gamestartscreen");
    },
    currentLevel: 0,
    courseCurrentLevel: 2,
    startCurrentLevel:function(){
        //获取用来构建关卡的数据
        var level;
        if(singleplayer.isCourse){
            level = courseMaps.singleplayer[singleplayer.courseCurrentLevel];
        }else{
            level = maps.singleplayer[singleplayer.currentLevel];
        }
        

        //加载资源完成之前，禁用“开始任务”按钮
        var enterMissionButton = document.getElementById("entermission");

        enterMissionButton.disabled = true;

        //加载用来创建关卡的资源
        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentLevel = level;

        game.offsetX = level.startX * game.gridSize;
        game.offsetY = level.startY * game.gridSize;


        //加载关卡的预加载单位类型
        game.resetArrays();
        for(var type in level.requirements){
            var requirementArray = level.requirements[type];
            for(var i = 0;i<requirementArray.length;i++){
                var name = requirementArray[i];
                if(window[type]){
                    //console.log(window[type]);
                    window[type].load(name);
                }else{
                    console.log("不能加载"+type);
                }
            }
        }

       for(var i = level.items.length-1;i>=0;i--){
            var itemDetails = level.items[i];
            game.add(itemDetails);
        }
        
        //创建网格，将不可通过的网格单位赋值1，可通行的赋值0
        game.currentMapTerrainGrid = [];
        for(var y = 0;y<level.mapGridHeight;y++){
            game.currentMapTerrainGrid[y] = [];
            for(var x = 0;x<level.mapGridWidth;x++){
                game.currentMapTerrainGrid[y][x] = 0;
            }
        };

        for(var i= level.mapObstructedTerrain.length-1;i>=0;i--){
            var obstruction = level.mapObstructedTerrain[i];
            game.currentMapTerrainGrid[obstruction[1]][obstruction[0]] = 1;
        };
        game.currentMapPassableGrid = undefined;


        game.rebuildPassableGrid();

        //为游戏加载启动资金
        game.cash = Object.assign({}, level.cash);

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
        
        littleMap.init();

        fog.initLevel();
        // Run the animation loop once
        game.animationLoop();

        // Start the animation loop interval
        game.animationInterval = setInterval(game.animationLoop, game.animationTimeout);

        game.start();
    },
    sendCommand:function(uids,details){
        game.processCommand(uids,details);
    },
    endLevel:function(success){
        clearInterval(game.animationInterval);
        game.end();
        
        if(success){
            if(singleplayer.isCourse){
                var moreLevels = (singleplayer.courseCurrentLevel < courseMaps.singleplayer.length-1);
            }else{
                var moreLevels = (singleplayer.currentLevel < maps.singleplayer.length-1);
            }
            
            if(moreLevels){
                game.showMessageBox("任务完成。",function(){
                    game.hideScreens();
                    // Start the next level
                    if(singleplayer.isCourse){
                        singleplayer.courseCurrentLevel++;
                    }else{
                        singleplayer.currentLevel++;
                    }
                    
                    singleplayer.startCurrentLevel();
                });
            }else{
                game.showMessageBox("任务完成。<br><br>这是战役中的最后一个任务。"
                +"<br<br>谢谢你的游玩。",function(){
                    game.hideScreens();
                    // Return to the main menu
                    game.showScreen("gamestartscreen");
                    star.stop = false;
                    star.animate();
                });
            }
        }else{
            game.showMessageBox("任务失败.<br><bt>再来一次?",function(){
                game.hideScreens();
                singleplayer.startCurrentLevel();
            },function(){
                game.hideScreens();
                game.showScreen("gamestartscreen");
            });
        }
    }
}