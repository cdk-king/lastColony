var terrain = {
    list:{
        "oilfield":{
            name:"oilfield",
            
            pixelWidth:40,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:20,
            pixelOffsetX:0,
            pixelOffsetY:40,
            buildableGrid:[
                [1,1]
            ],
            passableGrid:[
                [0,0]
            ],
            spriteImages:[
                {name:"hint",count:1},
                {name:"default",count:1}
            ],
        },
        "bigrocks":{
            name:"bigrocks",
            
            pixelWidth:40,
            pixelHeight:70,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:30,
            buildableGrid:[
                [1,1],
                [0,1]
            ],
            passableGrid:[
                [1,1],
                [0,1]
            ],
            spriteImages:[
                {name:"default",count:1}
            ],
        },
        "smallrocks":{
            name:"smallrocks",
            
            pixelWidth:20,
            pixelHeight:35,
            baseWidth:20,
            baseHeight:20,
            pixelOffsetX:0,
            pixelOffsetY:15,
            buildableGrid:[
                [1]
            ],
            passableGrid:[
                [1]
            ],
            spriteImages:[
                {name:"default",count:1}
            ],
        },
        "779-1":{
            name:"779-1",
            
            pixelWidth:94,
            pixelHeight:98,
            baseWidth:94,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:60,
            buildableGrid:[
                [1,1,1,1],
                [1,1,1,1],
            ],
            passableGrid:[
                [1,1,1,1],
                [1,1,1,1],
            ],
            spriteImages:[
                {name:"default",count:1}
            ],
        },
        "woods":{
            name:"woods",
            // isSheet:true,
            // sheetName:"ground",
            // sheetX:0,
            // sheetY:48,
            pixelWidth:48,
            pixelHeight:48,
            baseWidth:48,
            baseHeight:48,
            pixelOffsetX:0,
            pixelOffsetY:0,
            buildableGrid:[
                [1,1],
                [1,1],
            ],
            passableGrid:[
                [1,1],
                [1,1], 
            ],
            spriteImages:[
                {name:"default",count:1}
            ],
        },
        
    },
    defaults:{
        type:"terrain",
        animationIndex:0,
        action:"default",
        selected:false,
        selectable:false,
        animate:function(){
            switch (this.action){
                case "default":
                    this.imageList = this.spriteArray["default"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if(this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
                case "hint":
                    this.imageList = this.spriteArray["hint"];
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
            var colorOffset = 0;
            if(this.isSheet){
                game.foregroundContext.drawImage(this.spriteSheet,this.sheetX,this.sheetY,
                    this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);
            }else{
                game.foregroundContext.drawImage(this.spriteSheet,this.imageOffset*this.pixelWidth,colorOffset,
                    this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);
            }
            
        }
    },
    load:loadItem,
    add:addItem,
}