var vehicles = {
    list:{
        "scv":{
            name:"scv",
            pixelWidth:30,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:12,
            speed:15,
            sight:4,
            cost:300,
            hitPoints:30,
            turnSpeed:3,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        },
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
        "armoredcar":{
            name:"armoredcar",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            weaponType:"bullet",
            pixelWidth:30,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:13,
            speed:25,
            sight:5,
            cost:500,
            hitPoints:40,
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
                    //处理非整数方向值
                    var direction = wrapDirection(Math.round(this.direction),this.directions);
                    this.imageList = this.spriteArray["stand-"+direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
                case "teleport":
                    //处理非整数方向值
                    var direction = wrapDirection(Math.round(this.direction),this.directions);
                    this.imageList = this.spriteArray["stand-"+direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    if(!this.brightness){
                        this.brightness = 1;
                    }
                    this.brightness -=0.05;
                    if(this.brightness<=0){
                        this.brightness = undefined;
                        this.action = "stand";
                    }
                    break;
            }
        },
        draw:function(){
            var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX+(this.lastMovementX*game.drawingInterpolationFactor*game.gridSize);
            var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY+(this.lastMovementY*game.drawingInterpolationFactor*game.gridSize);

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
            
            //this.drawOrder();

            //绘制出现的光圈
            if(this.brightness){
                game.foregroundContext.beginPath();
                game.foregroundContext.arc(x+this.pixelOffsetX,y+this.pixelOffsetY,this.radius,0,Math.PI*2,false);
                game.foregroundContext.fillStyle = "rgba(255,255,255,"+this.brightness+")";
                game.foregroundContext.fill();
            }
        },
        drawOrder:drawOrder,
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
        isValidTarget:isValidTarget,
        findTargetsInSight:findTargetsInSight,
        findAllTargetsInSight:findAllTargetsInSight,
        reachedTarget:function(target){
            var item = target;
            if(item.type=="buildings"){
                //console.log(item.x+item.baseWidth/game.gridSize);
                //console.log(this.x+this.radius/2/game.gridSize);
                //rect1.x < rect2.x + rect2.width 
                //&& rect1.x + rect1.width > rect2.x 
                //&& rect1.y < rect2.y + rect2.height
                //&& rect1.height + rect1.y > rect2.y
                return (item.x<=this.x+this.radius/2/game.gridSize 
                    && item.x+item.baseWidth/game.gridSize>=this.x-this.radius/2/game.gridSize
                    && item.y<=this.y+this.radius/2/game.gridSize 
                    && item.y+item.baseHeight/game.gridSize>=this.y-this.radius/2/game.gridSize);
            }else if(item.type=="aircraft"){
                return (Math.pow(item.x-this.x,2)+Math.pow(item.y-(this.y+item.pixelShadowHeight/game.gridSize),2)
                <Math.pow((item.radius+this.radius)/game.gridSize,2));
            }else{
                return (Math.pow(item.x-this.x,2)+Math.pow(item.y-this.y,2)
                <Math.pow((item.radius+this.radius)/game.gridSize,2));
            }
        },
        processOrders:function(){
            this.lastMovementX = 0;
            this.lastMovementY = 0;
            if(this.reloadTimeLeft){
                this.reloadTimeLeft--;
            }
            if (this.orders.to) {
                var distanceFromDestination = Math.pow(Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2), 0.5);
            }
            var target;
            switch (this.orders.type){
                case "move":
                    //console.log("move");
                    //向目标位置移动，直到距离小于车辆半径
                    var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                   
                    if(distanceFromDestinationSquared < Math.pow(this.radius/game.gridSize,2)){
                        this.orders = {type:"stand"};
                        return;
                    }else if(this.colliding && distanceFromDestinationSquared < Math.pow(this.radius*3/game.gridSize,2)){
                        this.orders = {type:"stand"};
                        return;
                    }else{
                        
                        if (this.colliding && distanceFromDestinationSquared < Math.pow(this.radius*5/game.gridSize,2)) {
                            // Count collisions within 5 radius distance of goal
                            if (!this.orders.collisionCount) {
                                this.orders.collisionCount = 1;
                            } else {
                                this.orders.collisionCount ++;
                            }

                            // Stop if more than 30 collisions occur
                            if (this.orders.collisionCount > 30) {
                                console.log(distanceFromDestinationSquared);
                                this.orders = { type: "stand" };
                                break;
                            }
                        }
                        //试图向目标移动

                        // var targets = this.findTargetsInSight();
                        // if(targets.length>0){
                        //     this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                        //     return;
                        // }

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
                case "build":
                    //建造建筑物

                    //如果建造区域被临时占用，取消命令

                    //移动到建筑网格的中央
                    var targetBaseWidth = this.orders.details.baseWidth;
                    var targetBaseHeight = this.orders.details.baseHeight;
                    var target = {
                        x:this.orders.details.x+targetBaseWidth/2/game.gridSize,
                        y:this.orders.details.y+targetBaseHeight/2/game.gridSize,
                        type:"buildings"
                    };
                    console.log("判断是否到达");
                    //判断是否到达
                    var distanceFromDestinationSquared = (Math.pow(target.x-this.x,2)+Math.pow(target.y-this.y,2));
                    if(this.reachedTarget(this.orders.details)){
                        //到达目标
                        console.log("到达目标");
                        var item = game.add(this.orders.details);
                        game.cash[item.team] -= item.cost;
                        this.orders = { type: "stand" };
                    }else{
                        //未到达
                        console.log("未到达目标");
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        let moving = this.moveTo(this.orders.details, distanceFromDestination);
                        
                        
                        if (!moving) {
                            this.orders = { type: "stand" };
                        }
                    }
                    break;
                case "deploy":
                    //console.log("deploy");
                    //如果油田已经被使用了。取消命令
                    if(this.orders.to.lifeCode == "dead"){
                        this.orders = {type:"stand"};
                        return;
                    }
                    //移动到油田网格的中央
                    var target = {
                        x:this.orders.to.x+1,
                        y:this.orders.to.y+0.5,
                        type:"terrain"
                    };
                    
                    var distanceFromDestinationSquared = (Math.pow(target.x-this.x,2)+Math.pow(target.y-this.y,2));
                    if(distanceFromDestinationSquared<Math.pow(this.radius*2/game.gridSize,2)){
                        //到达油田后，旋转采油车使其面向左侧（方向值为6）
                        var difference = angleDiff(this.direction,6,this.directions);
                        var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
                        if(Math.abs(difference)>turnAmount){
                         // Change direction by turn amount
                            this.direction += turnAmount * Math.abs(difference) / difference;

                            // Ensure direction doesn't go below 0 or above this.directions
                            this.direction = (this.direction + this.directions) % this.directions;

                            this.turning = true;
                        } else {
                            this.direction = 6;
                            this.turning = false;
                        }
                        if (!this.turning) {
                            // If oil field has been used already, then cancel order
                            if (this.orders.to.lifeCode === "dead") {
                                this.orders = { type: "stand" };

                                return;
                            }

                            // Once it is pointing to the left, remove the harvester and oil field and deploy a harvester building
                            game.remove(this.orders.to);
                            this.orders.to.lifeCode = "dead";

                            game.remove(this);
                            this.lifeCode = "dead";

                            game.add({ type: "buildings", name: "harvester", x: this.orders.to.x, y: this.orders.to.y, action: "deploy", team: this.team });
                        }
                    }else{
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        let moving = this.moveTo(this.orders.to, distanceFromDestination);
                        
                        // Pathfinding couldn't find a path so stop
                        if (!moving) {
                            this.orders = { type: "stand" };
                        }
                    }
                    break;
                case "stand":
                    var targets = this.findTargetsInSight();
                    if(targets.length>0){
                        this.orders = {type:"attack",to:targets[0]};
                    }
                    break;
                case "sentry"://哨戒
                    var targets = this.findTargetsInSight(2);
                    if(targets.length>0){
                        this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                    }
                    break;
                case "hunt"://搜寻
                    var targets = this.findTargetsInSight(100);
                    if(targets.length>0){
                        this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                    }
                    break;
                case "attack":
                    if(this.orders.to.lifeCode == "dead" || !this.isValidTarget(this.orders.to)){
                        if(this.orders.nextOrder){
                            this.orders = this.orders.nextOrder;
                        }else{
                            this.orders = {type:"stand"};
                        }
                        return;
                    }
                    if((Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2))<Math.pow(this.sight,2)){
                        var newDirection = findFiringAngle(this.orders.to,this,this.directions);
                        var difference = angleDiff(this.direction,newDirection,this.directions);
                        var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
                        if(Math.abs(difference)>turnAmount){
                            this.direction = wrapDirection(this.direction+turnAmount*Math.abs(difference)/difference,this.directions);
                            this.turning = true;
                        }else{
                            this.direction = newDirection;
                            this.turning = false;
                            if(!this.reloadTimeLeft){
                                this.reloadTimeLeft = bullets.list[this.weaponType].reloadTime;
                                var angleRadians = -(Math.round(this.direction)/this.directions)*2*Math.PI; 
                                var bulletX = this.x-(this.radius*Math.sin(angleRadians)/game.gridSize);
                                var bulletY = this.y-(this.radius*Math.cos(angleRadians)/game.gridSize);
                                var bullet = game.add({
                                    name:this.weaponType,
                                    type:"bullets",
                                    x:bulletX,
                                    y:bulletY,
                                    direction:this.direction,
                                    target:this.orders.to
                                });
                            }
                        }
                    }else{
                        var moving = this.moveTo(this.orders.to,distanceFromDestination);
                        if(!moving){
                            this.orders = {type:"stand"};
                            return;
                        }
                    }
                    break;
                case "moveAndAttack":
                    //console.log("moveAndAttack");
                    //findTargetsInSight里会判断isValidTarget
                    var targets = this.findTargetsInSight();
                    if(targets.length>0){
                        // for(var i = 0;i<targets.length;i++){
                        //     var target = targets[i];
                        //     if(this.isValidTarget(target)){
                        //         this.orders = {type:"attack",to:targets[i],nextOrder:this.orders};
                        //         return;
                        //     }
                        // }
                        this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                        return;
                        // var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                        // var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        // let moving = this.moveTo(this.orders.to, distanceFromDestination);
                        
                        // // Pathfinding couldn't find a path so stop
                        // if (!moving) {
                        //     this.orders = { type: "stand" };
                        //     return;
                        // }
                    }else{
                        
                        var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                        if(this.colliding && distanceFromDestinationSquared < Math.pow(this.radius*3/game.gridSize,2)){
                            this.orders = {type:"stand"};
                            return;
                        }
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        let moving = this.moveTo(this.orders.to, distanceFromDestination);
                        
                        // Pathfinding couldn't find a path so stop
                        if (!moving) {
                            this.orders = { type: "stand" };
                            return;
                        }
                    }
                    break;
                case "patrol"://巡逻
                    var targets = this.findTargetsInSight(1);
                    if(targets.length>0){
                        this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                        return;
                    }
                    if((Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2))<Math.pow(this.sight/game.gridSize,2)){
                        var to = this.orders.to;
                        this.orders.to = this.orders.from;
                        this.orders.from = to
                    }else{
                        this.moveTo(this.orders.to,distanceFromDestination);
                    }
                    break;
                case "guard"://守卫
                    if(this.orders.to.lifeCode == "dead"){
                        if(this.orders.nextOrder){
                            this.orders = this.orders.nextOrder;
                        }else{
                            this.orders = {type:"stand"};
                        }
                        return;
                    }
                    //靠近守卫目标时，如果视野内有敌人，攻击它
                    if((Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2))<Math.pow(this.sight-1,2)){
                        var targets = this.findTargetsInSight(1);
                        if(targets.length>0){
                            this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                            return;
                        }
                        var targetToAttackTo = this.orders.to.findAllTargetsInSight(1);
                        if(targetToAttackTo.length>0){
                            for(var i = 0;i<targetToAttackTo.length;i++){
                                if(this.isValidTarget(targetToAttackTo[i])){
                                    this.orders = {type:"attack",to:targetToAttackTo[i],nextOrder:this.orders};
                                    return;
                                }
                            }
                        }
                        //todo 如何处理视野外的敌人
                    }else{
                        var targets = this.findTargetsInSight(1);
                        if(targets.length>0){
                            this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                            return;
                        }else{
                            this.moveTo(this.orders.to,distanceFromDestination);
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
                console.log("rebuildPassableGrid");
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
                //this.orders.path = [this,destination];
                this.orders.path = [[this.x, this.y], [destination.x, destination.y]];
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
                    //console.log(newDirection);
                }else{
                    //路径不存在
                    console.log("路径不存在");
                    console.log(end);
                    return false;
                }
            }
            
            //检查按照现有的方向运动是否会产生碰撞
            var collisionObjects = this.checkCollisionObjects(grid,distanceFromDestination);
            this.hardCollision = false;
            //console.log(collisionObjects.length);
            if(collisionObjects.length>0){
                this.colliding = true;
                //生成力向量对象为所有接触的物体添加斥力
                var forceVector = {x:0,y:0};
                //默认的，下一步有较小的引力
                collisionObjects.push(
                    {
                        collisionType:"attraction",
                        with:{
                            x:this.orders.path[1][0]+0.5,
                            y:this.orders.path[1][1]+0.5
                        }
                    }
                );
                for(var i = collisionObjects.length-1;i>=0;i--){
                    var collObject = collisionObjects[i];
                    //console.log(collObject);
                    var objectAngle = findAngle(collObject.with,this,this.directions);
                    var objectAngleRadius = -(objectAngle/this.directions)*2*Math.PI;
                    var forceMagnitude;
                    switch (collObject.collisionType){
                        case "hard":
                            forceMagnitude = 2;
                            this.hardCollision = true;
                            break;
                        case "soft":
                            forceMagnitude = 1;
                            break;
                        case "attraction":
                            forceMagnitude = -0.5;
                            break;
                    }
                    //console.log(forceMagnitude);
                    //没有加负号，因此这里是和方向相反的力
                    forceVector.x += (forceMagnitude*Math.sin(objectAngleRadius));
                    forceVector.y += (forceMagnitude*Math.cos(objectAngleRadius));

                };
                //console.log(forceVector);
                //根据力向量得到新的方向
                newDirection = findAngle(forceVector,{x:0,y:0},this.directions);
                
            }else{
                this.colliding = false;
            }
            

            //计算转向新方向的角度量
            var difference = angleDiff(this.direction,newDirection,this.directions);
            var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
            //console.log(difference);
            
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
            if(this.hardCollision){
                //硬碰撞的情况下,原地转向
                var movement = 0;
            }
            //转换坐标系角度
            //调整方向
            var angleRadians = -(this.direction/this.directions)*2*Math.PI;
            //沿着x轴旋转坐标系180度，xy值转换
            this.lastMovementX = -(movement*Math.sin(angleRadians));
            this.lastMovementY = -(movement*Math.cos(angleRadians));
            this.x = (this.x+this.lastMovementX);
            this.y = (this.y+this.lastMovementY);

            //var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
            // if(this.colliding && distanceFromDestinationSquared < Math.pow(this.radius*3/game.gridSize,2)){
            //     this.orders = {type:"stand"};
            //     return;
            // }


            return true;
        },
        turnTo: function(newDirection) {
            // Calculate difference between new direction and current direction
            let difference = this.angleDiff(newDirection);
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
        checkCollisionObjects:function(grid,distanceFromDestination){
            //计算当前路径上的下一个位置
            var maximumMovement = this.speed * game.speedAdjustmentFactor * (this.turning ? this.speedAdjustmentWhileTurningFactor : 1);
            var movement = Math.min(maximumMovement, distanceFromDestination);
            var angleRadians = -(this.direction/this.directions)*2*Math.PI;
            var newX = this.x-(movement*Math.sin(angleRadians));
            var newY = this.y-(movement*Math.cos(angleRadians));

            //下一步移动后会发生碰撞的车辆
            var collisionObjects = [];
            var x1 = Math.max(0,Math.floor(newX)-3);
            var x2 = Math.min(game.currentLevel.mapGridWidth-1,Math.floor(newX)+3);
            var y1 = Math.max(0,Math.floor(newY)-3);
            var y2 = Math.min(game.currentLevel.mapGridHeight-1,Math.floor(newY)+3);
            //最远测试三步以后
            for(var j = x1;j<=x2;j++){
                for(var i = y1;i<=y2;i++){
                    if(grid[i][j]==1){
                        //0.5网格居中
                        if(Math.pow(j+0.5-newX,2)+Math.pow(i+0.5-newY,2)<Math.pow(this.radius*1/game.gridSize,2)){
                            //车辆与阻塞网格间距离低于硬碰撞阈值
                            collisionObjects.push(
                                {
                                    collisionType:"hard",
                                    with:{
                                        type:"wall",
                                        x:j+0.5,
                                        y:i+0.5
                                    }
                                }
                            );
                            this.colliding = true;
                            this.hardCollision = true;

                        }else if(Math.pow(j+0.5-newX,2)+Math.pow(i+0.5-newY,2)<Math.pow(this.radius*1.1/game.gridSize,2)){
                            //车辆与阻塞网格间距离低于软碰撞阈值
                            collisionObjects.push(
                                {
                                    collisionType:"soft",
                                    with:{
                                        type:"wall",
                                        x:j+0.5,
                                        y:i+0.5
                                    }
                                }
                            );
                            this.colliding = true;
                            
                        }
                    }
                }
            }

            for(var i = game.vehicles.length-1;i>=0;i--){
                var vehicle = game.vehicles[i];
                //测试距离碰撞少于三步的车辆
                if(vehicle != this && Math.abs(vehicle.x-this.x)<3 && Math.abs(vehicle.y-this.y)<3){
                    if(Math.pow(vehicle.x-newX,2) + Math.pow(vehicle.y-newY,2)<Math.pow((this.radius+vehicle.radius)/game.gridSize,2)){
                        //车辆间的距离低于硬碰撞阈值（车辆半径之和）
                        collisionObjects.push(
                            {
                                collisionType:"hard",
                                with:vehicle
                            }
                        );
                        this.colliding = true;
                        this.hardCollision = true;
                    }else if(Math.pow(vehicle.x-newX,2) + Math.pow(vehicle.y-newY,2)<Math.pow((this.radius*1.1+vehicle.radius)/game.gridSize,2)){
                        //车辆间的距离低于硬碰撞阈值（车辆半径之和的1.5倍）
                        collisionObjects.push(
                            {
                                collisionType:"soft", 
                                with:vehicle
                            }
                        );
                        this.colliding = true;
                    }
                }
            }
            return collisionObjects;
        }
    },
    load:loadItem,
    add:addItem,
}