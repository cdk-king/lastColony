var aircraft = {
    list:{
        "chopper":{
            name:"chopper",
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            weaponType:"heatseeker",
            
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
                    var direction = this.direction;
                    this.imageList = this.spriteArray["fly-"+direction];
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
            var shadowOffset = 2*this.pixelHeight;

            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,
                this.pixelWidth,this.pixelHeight,x,y-this.pixelShadowHeight,this.pixelWidth,this.pixelHeight);

            game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,shadowOffset,
                this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);
        },
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
        
    },
    load:loadItem,
    add:addItem,
}