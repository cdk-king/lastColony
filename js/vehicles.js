var vehicles = {
    list:{
        "transport":{
            name:"transport",
            pixelWidth:31,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:15,
            speed:15,
            sight:3,
            cost:400,
            hitPoints:100,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        },
        "harvester":{
            name:"harvester",
            pixelWidth:21,
            pixelHeight:20,
            pixelOffsetX:10,
            pixelOffsetY:10,
            radius:10,
            speed:10,
            sight:3,
            cost:1600,
            hitPoints:50,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        },
        "scout-tank":{
            name:"scout-tank",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:false,
            weaponType:"bullet",
            pixelWidth:21,
            pixelHeight:21,
            pixelOffsetX:10,
            pixelOffsetY:10,
            radius:11,
            speed:20,
            sight:4,
            cost:500,
            hitPoints:50,
            turnSpeed:4,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        },
        "heavy-tank":{
            name:"heavy-tank",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:false,
            weaponType:"cannon-ball",
            pixelWidth:30,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:13,
            speed:15,
            sight:5,
            cost:1200,
            hitPoints:50,
            turnSpeed:4,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        },
    },
    defaults:{
        type:"vehicles",
        animationIndex:0,
        direction:0,
        action:"stand",
        orders:{
            type:"stand",
        },
        selected:false,
        selectable:true,
        directions:8,
        animate:function(){
            //生命值大于40%的单位
            if(this.life>this.hitPoints*0.4){
                this.lifeCode = "healthy";
            }else if(this.life<=0){
                this.lifeCode = "dead";
                game.remove(this);
                return;
            }else{
                this.lifeCode = "damaged";
            }

            switch (this.action){
                case "stand":
                    var direction = wrapDirection(Math.round(this.direction),this.directions);
                    this.imageList = this.spriteArray["stand-"+direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
            }
        },
        draw:function(){
            var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX;
            var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY;

            this.drawingX = x;
            this.drawingY = y;
            if(this.selected){
                this.drawSelection();
                this.drawLifeBar();
            }

            var colorIndex = (this.team == "blue")?0:1;
            var colorOffset = colorIndex*this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,
                this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);
        },
        drawLifeBar:function(){
            //var x = this.drawingX + this.pixelOffsetX;
            var x = this.drawingX;
            var y = this.drawingY - 2*game.lifeBarHeight;

            game.foregroundContext.fillStyle = (this.lifeCode == "healthy") ? game.healthBarHealthyFillColor:game.healthBarDamagedFillColor;

            game.foregroundContext.fillRect(x,y,this.pixelWidth*this.life/this.hitPoints,game.lifeBarHeight);

            game.foregroundContext.strokeStyle = game.healthBarBorderColor;

            game.foregroundContext.lineWidth = 1;
            
            game.foregroundContext.strokeRect(x,y,this.pixelWidth,game.lifeBarHeight);
            
        },
        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;

            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x,y,this.radius,0,Math.PI*2,false);
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();
            game.foregroundContext.stroke();
        },
        processOrders:function(){
            this.lastMovementX = 0;
            this.lastMovementY = 0;
            switch (this.orders.type){
                case "move":
                    //向目标位置移动，直到距离小于车辆半径
                    var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                    if(distanceFromDestinationSquared < Math.pow(this.radius/game.gridSize,2)){
                        this.orders = {type:"stand"};
                        return;
                    }else{
                        //试图向目标移动
                        //console.log("试图向目标移动");
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        var moving =this.moveTo(this.orders.to,distanceFromDestination);
                        if(!moving){
                            //寻径算法不能找到路径，停止
                            this.orders = {type:"stand"};
                            return;
                        }
                    }
                    break;
            }
        },
        // How slow should unit move while turning
        //讲道理转弯要慢
        speedAdjustmentWhileTurningFactor: 0.4,
        moveTo:function(destination,distanceFromDestination){
            if(!game.currentMapPassableGrid){
                game.rebuildPassableGrid();
            }

            //首先寻找到目标位置的路径
            var start = [Math.floor(this.x),Math.floor(this.y)];
            var end = [Math.floor(destination.x),Math.floor(destination.y)];

            var grid = game.makeArrayCopy(game.currentMapPassableGrid);
            //允许目标位置为”可通行“，以便算法找到一条路径
            if(destination.type == "buildings" || destination.type == "terrain"){
                grid[end[1]][end[0]] = 0;
            }

            var newDirection;

            let vehicleOutsideMapBounds = (start[1] < 0 || start[1] > game.currentLevel.mapGridHeight - 1 || start[0] < 0 || start[0] > game.currentLevel.mapGridWidth);
            let vehicleReachedDestinationTile = (start[0] === end[0] && start[1] === end[1]);
            
            //如果车辆在地图边缘之外，直接到达目标
            if(vehicleOutsideMapBounds || vehicleReachedDestinationTile){
                // Don't use A*. Just turn towards destination.
                this.orders.path = [this,destination];
                
                newDirection = findAngle(destination,this,this.directions);

                //this.orders.path = [[this.x, this.y], [destination.x, destination.y]];
            }else{
                //使用A*算法试图寻找到目标位置的路径
                this.orders.path =AStar(grid,start,end,"Euclidean");
                if(this.orders.path.length>1){
                    var nextStep = {
                        x:this.orders.path[1][0]+0.5,
                        y:this.orders.path[1][1]+0.5,
                    };
                    newDirection = findAngle(nextStep,this,this.directions);
                    console.log(newDirection);
                }else{
                    //路径不存在
                    console.log("路径不存在");
                    return false;
                }
            }
            
            //计算转向新方向的角度量
            var difference = angleDiff(this.direction,newDirection,this.directions);
            var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
            console.log(difference);
            if(Math.abs(difference)>turnAmount){
                this.direction = wrapDirection(this.direction+turnAmount*Math.abs(difference)/difference,this.directions);
                this.turning = true;
            }else{
                this.direction = newDirection;
                this.turning = false;
            }
            //向前移动，并按照需要转向
            var maximumMovement = this.speed * game.speedAdjustmentFactor * (this.turning ? this.speedAdjustmentWhileTurningFactor : 1);
            var movement = Math.min(maximumMovement, distanceFromDestination);
            var angleRadians = -(this.direction/this.directions)*2*Math.PI;
            this.lastMovementX = -(movement*Math.sin(angleRadians));
            this.lastMovementY = -(movement*Math.cos(angleRadians));
            this.x = (this.x+this.lastMovementX);
            this.y = (this.y+this.lastMovementY);

            return true;
        },
        turnTo: function(newDirection) {
            // Calculate difference between new direction and current direction
            let difference = this.angleDiff(newDirection);
            //console.log(this.direction);
            //console.log(difference);
            // Calculate maximum amount that aircraft can turn per animation cycle
            let turnAmount = this.turnSpeed * this.turnSpeedAdjustmentFactor;
    
            if (Math.abs(difference) > turnAmount) {
                // Change direction by turn amount
                this.direction += turnAmount * Math.abs(difference) / difference;
    
                // Ensure direction doesn't go below 0 or above this.directions
                this.direction = (this.direction + this.directions) % this.directions;
    
                this.turning = true;
            } else {
                this.direction = newDirection;
                this.turning = false;
            }
        },
    },
    load:loadItem,
    add:addItem,
}