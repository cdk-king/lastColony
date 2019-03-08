var sidebar = {
    init:function(){
        this.cash = document.getElementById("cash");

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
        var buttons = document.getElementById("sidebarbuttons").getElementsByTagName("input");
        
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
        
        if(baseSelected && !game.deployBuilding){
            if(game.currentLevel.requirements.buildings.indexOf("starport")>-1 && cashBalance>=buildings.list["starport"].cost){
                document.getElementById("starportbutton").disabled = false;
            }
            if(game.currentLevel.requirements.buildings.indexOf("ground-turret")>-1 && cashBalance>=buildings.list["ground-turret"].cost){
                document.getElementById("turretbutton").disabled = false;
            }
        }

        if(starportSelected){
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
    }
}