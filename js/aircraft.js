var aircraft = {
    list:{
        "chopper":{
            name:"chopper",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            weaponType:"heatseeker",
            //weaponType:"rocket",
            
            pixelWidth:40,
            pixelHeight:40,
            pixelOffsetX:20,
            pixelOffsetY:20,

            radius:18,
            sight:6,
            cost:900,
            hitPoints:50,
            speed:25,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
        "wraith":{
            name:"wraith",
            canAttack:true,
            canAttackLand:false,
            canAttackAir:true,
            weaponType:"fireball",
            
            pixelWidth:30,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,

            radius:15,
            sight:8,
            cost:600,
            hitPoints:50,
            speed:40,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:1,directions:8}
            ],
        },
        "unit_jet":{
            name:"unit_jet",
            canAttack:true,
            canAttackLand:false,
            canAttackAir:true,
            weaponType:"fireball",
            
            pixelWidth:40,
            pixelHeight:40,
            pixelOffsetX:20,
            pixelOffsetY:20,

            radius:15,
            sight:8,
            cost:600,
            hitPoints:50,
            speed:40,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:1,directions:8}
            ],
        },
    },
    defaults:{
        type:"aircraft",
        animationIndex:0,
        direction:0,
        directions:8,
        action:"fly",
        selected:false,
        selectable:true,
        orders:{
            type:"float"
        },
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
                case "fly":
                    var direction = wrapDirection(Math.round(this.direction),this.directions);
                    this.imageList = this.spriteArray["fly-"+direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
                case "teleport":
                    //处理非整数方向值
                    var direction = wrapDirection(Math.round(this.direction),this.directions);
                    this.imageList = this.spriteArray["fly-"+direction];
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
                        this.action = "fly";
                    }
                    break;
            }
        },
        draw:function(){
            //console.log(game.drawingInterpolationFactor);
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
            var shadowOffset = 2*this.pixelHeight;

            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,
                this.pixelWidth,this.pixelHeight,x,y-this.pixelShadowHeight,this.pixelWidth,this.pixelHeight);

            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,shadowOffset,
                this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);

            //绘制出现的光圈
            if(this.brightness){
                game.foregroundContext.beginPath();
                game.foregroundContext.arc(x+this.pixelOffsetX,y+this.pixelOffsetY-this.pixelShadowHeight,this.radius,0,Math.PI*2,false);
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

            game.foregroundContext.fillRect(x,y-this.pixelShadowHeight,this.pixelWidth*this.life/this.hitPoints,game.lifeBarHeight);

            game.foregroundContext.strokeStyle = game.healthBarBorderColor;

            game.foregroundContext.lineWidth = 1;
            
            game.foregroundContext.strokeRect(x,y-this.pixelShadowHeight,this.pixelWidth,game.lifeBarHeight);
            
        },
        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;

            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 2;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x,y-this.pixelShadowHeight,this.radius,0,Math.PI*2,false);
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();
            game.foregroundContext.stroke();

            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x,y,4,0,Math.PI*2,false);
            game.foregroundContext.stroke();

            game.foregroundContext.beginPath();
            game.foregroundContext.moveTo(x,y);
            game.foregroundContext.lineTo(x,y-this.pixelShadowHeight);
            game.foregroundContext.stroke();
        },
        isValidTarget:isValidTarget,
        findTargetsInSight:findTargetsInSight,
        findAllTargetsInSight:findAllTargetsInSight,
        processOrders:function(){
            this.lastMovementX = 0;
            this.lastMovementY = 0;
            if(this.reloadTimeLeft){
                this.reloadTimeLeft--;
            }
            if (this.orders.to) {
                var distanceFromDestination = Math.pow(Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2), 0.5);
            }

            switch (this.orders.type){
                case "float":
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
                            this.orders = {type:"float"};
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
                                var bulletY = this.y-(this.radius*Math.cos(angleRadians)/game.gridSize)-this.pixelShadowHeight/game.gridSize;
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
                    }
                    break;
                case "patrol"://巡逻
                    var targets = this.findTargetsInSight(1);
                    if(targets.length>0){
                        this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                        return;
                    }
                    if((Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2))<Math.pow(this.radius/game.gridSize,2)){
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
                            this.orders = {type:"float"};
                        }
                        return;
                    }
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
                case "move":
                    //向目的地移动，直到飞行器与目的地的距离小于飞行器的半径
                    var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                    if(distanceFromDestinationSquared < Math.pow(this.radius/game.gridSize,2)){
                        this.orders = {type:"float"};
                    }else if(this.colliding && distanceFromDestinationSquared < Math.pow(this.radius*2/game.gridSize,2)){
                        this.orders = {type:"float"};
                        return;
                    }
                    else{
                        // var targets = this.findTargetsInSight();
                        // if(targets.length>0){
                        //     this.orders = {type:"attack",to:targets[0],nextOrder:this.orders};
                        //     return;
                        // }
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        this.moveTo(this.orders.to,distanceFromDestination);
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
                        //console.log("moveAndAttack");
                        return;
                        // var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                        // var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        // this.moveTo(this.orders.to,distanceFromDestination);
                    }else{
                        var distanceFromDestinationSquared = (Math.pow(this.orders.to.x-this.x,2)+Math.pow(this.orders.to.y-this.y,2));
                        var distanceFromDestination = Math.pow(distanceFromDestinationSquared,0.5);
                        this.moveTo(this.orders.to,distanceFromDestination);
                    }
                    break;
            }
        },
        // How slow should unit move while turning
        //讲道理转弯要慢
        speedAdjustmentWhileTurningFactor: 0.4,
        moveTo:function(destination,distanceFromDestination){
            //计算飞行到目的地的方向
            var newDirection = findAngle(destination,this,this.directions);
            //console.log(this.direction);
            //console.log(this.x);
            //console.log(newDirection);
            

            //检查按照现有的方向运动是否会产生碰撞
            var collisionObjects = this.checkCollisionObjects(distanceFromDestination);
            this.hardCollision = false;
            if(collisionObjects.length>0){
                this.colliding = true;
                //生成力向量对象为所有接触的物体添加斥力
                var forceVector = {x:0,y:0};
                for(var i = collisionObjects.length-1;i>=0;i--){
                    var collObject = collisionObjects[i];
                    //console.log(collObject);
                    var objectAngle = findAngle(collObject.with,this,this.directions);
                    var objectAngleRadius = -(objectAngle/this.directions)*2*Math.PI;
                    var forceMagnitude;
                    console.log(collObject.collisionType);
                    switch (collObject.collisionType){
                        case "hard":
                            forceMagnitude = 2;
                            this.hardCollision = true;
                            break;
                        case "soft":
                            forceMagnitude = 1;
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
            

            //计算当前方向与新方向差
            var difference = angleDiff(this.direction,newDirection,this.directions);
            //console.log(difference);
            //计算每个动画循环飞行器转过的角度
            var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
            if(Math.abs(difference)>turnAmount){
                //console.log(turnAmount*Math.abs(difference)/difference);
                this.direction = wrapDirection(this.direction+turnAmount*Math.abs(difference)/difference,this.directions);
                //this.direction = (this.direction + this.directions) % this.directions;
                this.turning = true;
            }else{
                this.direction =newDirection;
                this.turning = false;
            }

            // Calculate maximum distance that aircraft can move per animation cycle
            var maximumMovement = this.speed * game.speedAdjustmentFactor * (this.turning ? this.speedAdjustmentWhileTurningFactor : 1);
            var movement = Math.min(maximumMovement, distanceFromDestination);
            //计算每个动画循环飞行器应当移动的距离
            //var movement = this.speed*game.speedAdjustmentFactor;
            //计算移动距离的x和y分量
            var angleRadians = -(this.direction/this.directions)*2*Math.PI;
            //console.log(angleRadians);
            //console.log(distanceFromDestination);
            this.lastMovementX = -(movement*Math.sin(angleRadians));
            this.lastMovementY = -(movement*Math.cos(angleRadians));
            //console.log(this.direction);
            this.x = (this.x+this.lastMovementX);
            this.y = (this.y+this.lastMovementY);
            //console.log(this.lastMovementX);
        },
        checkCollisionObjects:function(distanceFromDestination){
            var collisionObjects = [];
            var maximumMovement = this.speed * game.speedAdjustmentFactor * (this.turning ? this.speedAdjustmentWhileTurningFactor : 1);
            var movement = Math.min(maximumMovement, distanceFromDestination);
            //计算每个动画循环飞行器应当移动的距离
            //var movement = this.speed*game.speedAdjustmentFactor;
            //计算移动距离的x和y分量
            var angleRadians = -(this.direction/this.directions)*2*Math.PI;
            var lastMovementX = -(movement*Math.sin(angleRadians));
            var lastMovementY = -(movement*Math.cos(angleRadians));
            //console.log(this.direction);
            var newX = (this.x+lastMovementX);
            var newY = (this.y+lastMovementY);
            for(var i = game.aircraft.length-1;i>=0;i--){
                var aircraft = game.aircraft[i];
                //测试距离碰撞少于三步的飞行器
                if(aircraft != this && Math.abs(aircraft.x-this.x)<3 && Math.abs(aircraft.y-this.y)<3){
                    if(Math.pow(aircraft.x-newX,2) + Math.pow(aircraft.y-newY,2)<Math.pow((this.radius+aircraft.radius)*0.2/game.gridSize,2)){
                        //飞行器间的距离低于硬碰撞阈值（飞行器半径之和）
                        collisionObjects.push(
                            {
                                collisionType:"hard",
                                with:aircraft
                            }
                        );
                        this.colliding = true;
                        this.hardCollision = true;
                    }else if(Math.pow(aircraft.x-newX,2) + Math.pow(aircraft.y-newY,2)<Math.pow((this.radius+aircraft.radius)*0.5/game.gridSize,2)){
                        //车辆间的距离低于硬碰撞阈值（车辆半径之和的1.5倍）
                        collisionObjects.push(
                            {
                                collisionType:"soft", 
                                with:aircraft
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