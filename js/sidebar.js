var sidebar = {
    init:function(){
        this.cash = document.getElementById("cash");
        document.getElementById("armoredcarbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"vehicles","name":"armoredcar"});
        });
        document.getElementById("scouttankbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"vehicles","name":"scout-tank"});
        });
        document.getElementById("heavytankbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"vehicles","name":"heavy-tank"});
        });
        document.getElementById("harvesterbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"vehicles","name":"harvester"});
        });
        document.getElementById("chopperbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"aircraft","name":"chopper"});
        });
        document.getElementById("wraithbutton").addEventListener("click",function(){
            sidebar.constructAtStarport({type:"aircraft","name":"wraith"});
        });

        //初始化建筑建造按钮
        document.getElementById("starportbutton").addEventListener("click",function(){
            game.deployBuilding = "starport";
        });
        document.getElementById("turretbutton").addEventListener("click",function(){
            game.deployBuilding = "ground-turret";
        });
        this.hideSidebarbuttons();
    },
    constructAtStarport:function(unitDetails){
        var starport;
        //在选中的单位中找到第一个合适的星港
        for(var i = game.selectedItems.length-1;i>=0;i--){
            var item = game.selectedItems[i];
            if(item.type == "buildings" && item.name == "starport" && item.team==game.team && item.lifeCode == "healthy" && item.action == "stand"){
                starport = item;
                break;
            }
        };
        if(starport){
            game.sendCommand([starport.uid],{type:"construct-unit",details:unitDetails});
        }
    },
    animate:function(){
        //显示当前资金数目
        
        // Display the current cash balance value
        this.updateCash(game.cash[game.team]);

        // Enable buttons if player has sufficient cash and has the correct building selected
        this.enableSidebarButtons();

        if(game.deployBuilding){
            //创建可用于建造的网格，以示建筑可能被放置的位置
            game.rebuildBuildableGrid();
            //与可用于建造建筑的网格对比，以示能否在当前鼠标位置放置建筑
            var placementGrid = game.makeArrayCopy(buildings.list[game.deployBuilding].buildableGrid);
            game.placementGrid = placementGrid;
            game.canDeployBuilding = true;
            //console.log(mouse.gameX);
            //console.log(mouse.gridX);
            //console.log(mouse.gameY );
            //console.log(placementGrid);
            for(var i = game.placementGrid.length-1;i>=0;i--){
                for(var j = game.placementGrid[i].length-1;j>=0;j--){
                    
                    //console.log(game.currentMapPassableGrid[mouse.gridY][mouse.gridX]);
                    if(game.placementGrid[i][j] 
                    && (mouse.gridY+i>=game.currentLevel.mapGridHeight || mouse.gridX+j>=game.currentLevel.mapGridWidth || 
                    game.currentMapPassableGrid[mouse.gridY+i][mouse.gridX+j] == 1 || fog.grid[game.team][mouse.gridY+i][mouse.gridX+j]==1) 
                        ){
                            game.canDeployBuilding = false;
                            game.placementGrid[i][j] = 0;
                    }
                }
            }
        }
    },
    // Cache the value to avoid unnecessary DOM updates
    _cash: undefined,
    updateCash: function(cash) {
        // Only update the DOM value if it is different from cached value
        if (this._cash !== cash) {
            this._cash = cash;
            // Display the cash amount with commas
            this.cash.innerHTML = cash.toLocaleString();
        }
    },
    enableSidebarButtons:function(){
        //仅当相应的建筑被选中时启用按钮
        var buttons = document.getElementById("sidebar").getElementsByTagName("input");
        
        for(var i = 0;i<buttons.length;i++){
            buttons[i].disabled=true;
        }

        if(game.selectedItems.length == 0){
            return;
        }

        // Check if player has a base or starport selected
        let baseSelected = false;
        let starportSelected = false;

        game.selectedItems.forEach(function(item) {
            if (item.team === game.team && item.lifeCode === "healthy" && item.action === "stand") {
                if (item.name === "base") {
                    baseSelected = true;
                } else if (item.name === "starport") {
                    starportSelected = true;
                }
            }
        });

        let cashBalance = game.cash[game.team];

        //
        this.hideSidebarbuttons();
        
        if(baseSelected && !game.deployBuilding){
            document.getElementById("basebtn").style.display = "block";
            if(game.currentLevel.requirements.buildings.indexOf("starport")>-1 && cashBalance>=buildings.list["starport"].cost){
                document.getElementById("starportbutton").disabled = false;
            }
            if(game.currentLevel.requirements.buildings.indexOf("ground-turret")>-1 && cashBalance>=buildings.list["ground-turret"].cost){
                document.getElementById("turretbutton").disabled = false;
            }
        }

        if(starportSelected){
            document.getElementById("starportbtn").style.display = "block";
            if(game.currentLevel.requirements.vehicles.indexOf("armoredcar")>-1 && cashBalance>=vehicles.list["armoredcar"].cost){
                document.getElementById("armoredcarbutton").disabled = false;
            }
            if(game.currentLevel.requirements.vehicles.indexOf("scout-tank")>-1 && cashBalance>=vehicles.list["scout-tank"].cost){
                document.getElementById("scouttankbutton").disabled = false;
            }
            if(game.currentLevel.requirements.vehicles.indexOf("heavy-tank")>-1 && cashBalance>=vehicles.list["heavy-tank"].cost){
                document.getElementById("heavytankbutton").disabled = false;
            }
            if(game.currentLevel.requirements.vehicles.indexOf("harvester")>-1 && cashBalance>=vehicles.list["harvester"].cost){
                document.getElementById("harvesterbutton").disabled = false;
            }
            if(game.currentLevel.requirements.aircraft.indexOf("chopper")>-1 && cashBalance>=aircraft.list["chopper"].cost){
                document.getElementById("chopperbutton").disabled = false;
            }
            if(game.currentLevel.requirements.aircraft.indexOf("wraith")>-1 && cashBalance>=aircraft.list["wraith"].cost){
                document.getElementById("wraithbutton").disabled = false;
            }
        }
    },
    hideSidebarbuttons:function(){
        var eles = document.getElementsByClassName("sidebarbuttons");
        if(eles.length>0){
            for(var i = 0;i<eles.length;i++){
                var ele = eles[i];
                ele.style.display = "none";
            }
        }
    },
    cancelDeployingBuilding:function(){
        game.deployBuilding = undefined;
        sidebar.placementGrid = undefined;
        sidebar.canDeployBuilding = false;
    },
    finishDeployingBuilding:function(){
        var buildingName = game.deployBuilding;
        var base;
        for(var i = game.selectedItems.length-1;i>=0;i--){
            var item = game.selectedItems[i];
            if(item.type == "buildings" && item.name == "base" && item.team == game.team 
            && item.lifeCode == "healthy" && item.action == "stand"){
                base = item;
                break;
            }
        };
        if(base){
            var buildingDetails = {type:"buildings",name:buildingName,x:mouse.gridX,y:mouse.gridY};
            game.sendCommand([base.uid],{type:"construct-building",details:buildingDetails});
        }
        //清除deployBuilding标签
        game.deployBuilding = undefined;
    }
}