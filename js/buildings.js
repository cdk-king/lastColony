var buildings = {
    list:{
        "base":{
            name:"base",
            //绘图属性
            station:{
                offsetX:40,
                offsetY:20
            },
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:20,
            //描述查找路线算法结构的属性
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            sight:4,
            hitPoints:500,
            cost:5000,
            spriteImages:[
                {name:"healthy",count:4},
                {name:"damaged",count:1},
                {name:"contructing",count:3},
            ],
        },
        "starport":{
            name:"starport",
            pixelWidth:40,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:55,
            pixelOffsetX:1,
            pixelOffsetY:5,
            buildableGrid:[
                [1,1],
                [1,1],
                [1,1],
            ],
            passableGrid:[
                [1,1],
                [0,0],
                [0,0],
            ],
            sight:3,
            cost:2000,
            hitPoints:300,
            spriteImages:[
                {name:"teleport",count:9},
                {name:"closing",count:18},         
                {name:"healthy",count:4},
                {name:"damaged",count:1},        
            ],
        },
        "harvester":{
            name:"harvester",
            pixelWidth:40,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:20,
            pixelOffsetX:-2,
            pixelOffsetY:40,
            buildableGrid:[
                [1,1],
            ],
            passableGrid:[
                [1,1],
            ],
            sight:3,
            cost:5000,
            hitPoints:300,
            spriteImages:[
                {name:"deploy",count:17},    
                {name:"healthy",count:3},
                {name:"damaged",count:1},        
            ],
        },
        "ground-turret":{
            name:"ground-turret",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:false,
            weaponType:"cannon-ball",
            action:"guard",//默认动作
            direction:0,//默认朝向北方
            directions:8,//允许八个方向
            orders:{
                type:"guard"
            },
            pixelWidth:38,
            pixelHeight:32,
            baseWidth:20,
            baseHeight:18,
            pixelOffsetX:9,
            pixelOffsetY:12,
            buildableGrid:[
                [1],
            ],
            passableGrid:[
                [1],
            ],
            sight:5,
            cost:1500,
            hitPoints: 200,
            spriteImages:[
                {name:"teleport",count:9},    
                {name:"healthy",count:1,directions:8},
                {name:"damaged",count:1},        
            ],
            isValidTarget:isValidTarget,
            findTargetsInSight:findTargetsInSight,
            
            processOrders:function(){
                if(this.reloadTimeLeft){
                    this.reloadTimeLeft--;
                }
    
                //损坏的炮塔不能攻击
                if(this.lifeCode!="healthy"){
                    return;
                }

                switch (this.orders.type){
                    case "guard":
                        var targets = this.findTargetsInSight();
                        if(targets.length>0){
                            this.orders = {type:"attack",to:targets[0]};
                        }
                        break;
                    case "attack":
                        //丢失目标
                        if(!this.orders.to || this.orders.to.lifeCode=="dead" || 
                        !this.isValidTarget(this.orders.to) ||
                        Math.pow(this.orders.to.x-this.x,2) + Math.pow(this.orders.to.y-this.y,2)>Math.pow(this.sight,2)
                        ){
                            var targets = this.findTargetsInSight();
                            if(targets.length>0){
                                //更换目标
                                this.orders.to = targets[0]
                            }else{
                                //守卫
                                this.orders = {type:"guard"};
                            }
                        }

                        if(this.orders.to){
                            //console.log(this.orders.to);
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
                                    var bulletX = this.x+0.5-(Math.sin(angleRadians));
                                    var bulletY = this.y+0.5-(Math.cos(angleRadians));
                                    var bullet = game.add({
                                        name:this.weaponType,
                                        type:"bullets",
                                        x:bulletX,
                                        y:bulletY,
                                        direction:this.direction,
                                        target:this.orders.to
                                    });
                                    //console.log(bulletX);
                                    //console.log(bulletY);
                                }

                            }
                            
                        }
                        break;
                    
                }
            }
        },
    },
    defaults:{
        type:"buildings",
        animationIndex:0,
        direction:0,
        orders:{
            type:"stand"
        },
        action:"stand",
        selected:false,
        selectable:true,
        findAllTargetsInSight:findAllTargetsInSight,
        //建筑的默认动画循环
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
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
                case "construct":
                    this.imageList = this.spriteArray["contructing"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    //construct模式结束后，回到stand模式
                    if(this.animationIndex >= this.imageList.count){
                        this.animationIndex = 0;
                        this.action = "stand";
                    }
                    break;
                case "teleport":
                    this.imageList = this.spriteArray["teleport"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    //teleport模式结束后，回到stand模式或guard模式
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                        if(this.canAttack){
                            this.action = "guard";
                        }else{
                            this.action = "stand";
                        }
                    }
                    break;
                case "close":
                    this.imageList = this.spriteArray["closing"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    //close模式结束后，回到stand模式
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                        this.action = "stand";
                    }
                    break;
                case "open":
                    this.imageList = this.spriteArray["closing"];
                    //open模式的动画，就是逆向显示close模式动画
                    this.imageOffset = this.imageList.offset +this.imageList.count - this.animationIndex;
                    this.animationIndex++;
                    //open模式结束后，回到close模式
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                        this.action = "close";
                        //如果constructUnit
                        //console.log(this.constructUnit);
                        if(this.constructUnit){
                            var item = game.add(this.constructUnit);
                            //console.log(item);
                            this.constructUnit = undefined;
                        }
                    }
                    break;
                case "deploy":
                    this.imageList = this.spriteArray["deploy"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    //deploy模式结束后，转到stand模式
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                        this.action = "harvest";
                    }
                    break;
                case "harvest":
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;

                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        if (this.lifeCode === "healthy") {
                            // Harvesters mine 2 credits of cash per animation cycle
                            //console.log("cash");
                            game.cash[this.team] += 2;
                        }
                    }

                    break;
                case "guard":
                    if(this.lifeCode == "damaged"){
                        //损坏的炮塔没有方向
                        this.imageList = this.spriteArray[this.lifeCode];
                    }else{
                        //完好的炮塔有八个方向
                        var direction = wrapDirection(Math.round(this.direction),this.directions);
                        this.imageList = this.spriteArray[this.lifeCode+"-"+direction];
                    }
                    this.imageOffset = this.imageList.offset;
                    break;
            }
        },
        //建筑的默认绘图循环
        draw:function(){
            var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX; 
            var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY; 

            this.drawingX = x;
            this.drawingY = y;
            if(this.selected){
                this.drawSelection();
                this.drawLifeBar();
            }
            
            //所有的子画面页中，第一行都是蓝队，第二行都是绿队
            var colorIndex = (this.team == "blue")?0:1;
            var colorOffset = colorIndex*this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,this.pixelWidth,this.pixelHeight,
                x,y,this.pixelWidth,this.pixelHeight);
            
        },
        drawLifeBar:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY - 2*game.lifeBarHeight;

            game.foregroundContext.fillStyle = (this.lifeCode == "healthy") ? game.healthBarHealthyFillColor:game.healthBarDamagedFillColor;

            game.foregroundContext.fillRect(x,y,this.baseWidth*this.life/this.hitPoints,game.lifeBarHeight);

            game.foregroundContext.strokeStyle = game.healthBarBorderColor;

            game.foregroundContext.strokeRect(x,y,this.baseWidth,game.lifeBarHeight);
            
        },
        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;

            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fillRect(x-1,y-1,this.baseWidth+2,this.baseHeight+2);
            game.foregroundContext.strokeRect(x-1,y-1,this.baseWidth+2,this.baseHeight+2);
        },
        processOrders:function(){
            //console.log(this.orders.type);
            switch (this.orders.type){
                case "construct-unit":
                    console.log("construct-unit");
                    //基地
                    if(this.name=="base"){
                        console.log("base-construct-unit");
                        //确认集结地有无其他单位

                        //
                        this.action = "construct";
                        this.animationIndex = 0;
                        //深度拷贝
                        let itemDetails = Object.assign({}, this.orders.details);
                        var radius = window[this.orders.details.type].list[this.orders.details.name].radius;
                        itemDetails.x = this.x+(this.station.offsetX+radius)/game.gridSize;
                        itemDetails.y = this.y+this.station.offsetY/game.gridSize;
                        //出现新的单位，并从玩家资金中扣除耗费
                        itemDetails.action = "teleport";
                        itemDetails.team = this.team;
                        var cost = window[this.orders.details.type].list[this.orders.details.name].cost;
                        game.cash[this.team] -= cost;
                        //this.constructUnit = Object.assign([],itemDetails);
                        this.constructUnit = itemDetails;
                        var item = game.add(this.constructUnit);
                        //console.log(item);
                        this.constructUnit = undefined;
                        this.orders = {type:"stand"};
                        return;
                    }
                    //星港
                    if(this.lifeCode!="healthy"){
                        return;
                    }
                    //首先确保在建筑上没有其他单位
                    var unitOnTop = false;
                    for(var i = game.items.length-1;i>=0;i--){
                        var item = game.items[i];
                        if(item.type == "vehicles" || item.type == "aircraft"){
                            if(item.x>this.x && item.x<this.x+2 && item.y>this.y && item.y<this.y+3){
                                unitOnTop = true;
                                break;
                            }
                        }
                    };

                    var cost = window[this.orders.details.type].list[this.orders.details.name].cost;
                    if(unitOnTop){
                        console.log("登陆舱被占用");
                        if(this.team == game.team){
                            game.showMessage("system","警告！当登陆舱被占用时，不能传送单位。");
                        }
                    }else if(game.cash[this.team]<cost){
                        console.log("不足的资金");
                        if(this.team == game.team){
                            game.showMessage("system","警告！不足的资金，需要"+cost+" 金钱。");
                        }
                    }else{
                        this.action = "open";
                        this.animationIndex = 0;
                        //新的单位将出现在星港中心位置上方

                        //??????
                        //let itemDetails = this.orders.details;
                        //console.log(this);
                        //必须深度拷贝，浅拷贝会改变order
                        let itemDetails = Object.assign({}, this.orders.details);
                        
                        itemDetails.x = this.x+0.5*this.pixelWidth/game.gridSize;
                        itemDetails.y = this.y+0.5*this.pixelHeight/game.gridSize;
                        //出现新的单位，并从玩家资金中扣除耗费
                        itemDetails.action = "teleport";
                        itemDetails.team = this.team;
                        game.cash[this.team] -= cost;
                        //this.constructUnit = Object.assign([],itemDetails);
                        this.constructUnit = itemDetails;
                        //console.log(this.constructUnit);
                    }
                    this.orders = {type:"stand"};
                    break;
                case "construct-building":
                    this.action = "construct";
                    this.animationIndex = 0;
                    var itemDetails = this.orders.details;
                    
                    itemDetails.action = "teleport";
                    itemDetails.team = this.team;
                    //出现新的单位，并从玩家资金中扣除耗费
                    var item = game.add(itemDetails);
                    game.cash[this.team] -= item.cost; 

                    this.orders = {type:"stand"};
                    break;
                
            }
        }
    },
    load:loadItem,
    add:addItem
}