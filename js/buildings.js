var buildings = {
    list:{
        "base":{
            name:"base",
            //绘图属性
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
            sight:3,
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
                        this.lifeCode = "stand";
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
                    }
                    break;
            }
        },
        //建筑的默认绘图循环
        draw:function(){
            var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX; 
            var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY; 
            
            //所有的子画面页中，第一行都是蓝队，第二行都是绿队
            var colorIndex = (this.team == "blue")?0:1;
            var colorOffset = colorIndex*this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,this.pixelWidth,this.pixelHeight,
                x,y,this.pixelWidth,this.pixelHeight);
            
        }
    },
    load:loadItem,
    add:addItem
}