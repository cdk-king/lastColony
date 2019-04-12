var light = {
    //https://www.cnblogs.com/miloyip/archive/2010/03/29/1698953.html
    //https://www.cnblogs.com/miloyip/archive/2010/04/02/1702768.html
    //https://www.cnblogs.com/miloyip/archive/2010/06/14/Kinematics_ParticleSystem.html
    canvas:document.createElement("canvas"),
    //ctx : {} ,
    width:0,
    height:0,
    imageData:[],
    plane:{
        center: [ 250, 250, 0 ],    // 平面中心点坐标
        width: 660,                 // 宽
        height: 480,              // 高
        normal: [ 0, 0, 1 ],        // 朝向，即法向量
        color: { r: 255, g: 255, b: 255 }   // 颜色
    },
    pointLight:{
        position: [ 700, -150, 150 ],
        color: {
            r: 255,
            g: 246,
            b: 143,
            a: 255
        }
    },
    init:function(){
        var gameContainer = document.getElementById("gamecontainer");
        var gameScale = gameContainer.clientWidth/640;
        var maxWidth = window.innerWidth;
        var maxHeight = window.innerHeight;

        var scale = Math.min(maxWidth / 640, maxHeight / 480);
        var width = Math.max(640, Math.min(1024, maxWidth / scale ));
        this.width = width;
        this.height = document.getElementById("gamecontainer").clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.style.zIndex = -1;
        //this.canvas.style.border = "1px solid red";
        //this.context = this.canvas.getContext("2d");
        document.getElementById("gamestartscreen").appendChild(this.canvas);

        this.ctx  = this.canvas.getContext( '2d' );
        this.imageData = this.ctx.getImageData( 0,0,this.plane.width, this.plane.height );
        //this.imageData = this.ctx.createImageData( this.plane.width, this.plane.height );
        light.canvas.addEventListener( 'mousemove', function( e ) {
            let offset = light.canvas.getBoundingClientRect();
            light.pointLight.position[ 0 ] = (e.clientX-offset.left)/ game.scale;
            light.pointLight.position[ 1 ] = (e.clientY- offset.top)/ game.scale;
            
        }, false )
        light.canvas.addEventListener( 'wheel', function( e ) {
            if(light.pointLight.position[ 2 ]>=0){
                light.pointLight.position[ 2 ] += e.deltaY * 0.04;
            }else{
                light.pointLight.position[ 2 ] =0;
            }
            //light.render();
        }, false )
    },
    render:function(){
        //this.imageData = star.context.getImageData( 0,0,this.plane.width, this.plane.height );
        this.imageData = this.ctx.createImageData( this.plane.width, this.plane.height );
        for ( var x = 0; x < this.imageData.width; x++ ) {
            for ( var y = 0; y < this.imageData.height; y++ ) {
                var index = y * this.imageData.width + x;

                var position = [ x, y, 0 ];
                var normal = [ 0, 0, 1 ];
                var reverseLightDirection = this.sub( this.pointLight.position, position );
                //var currentToLight = normalize( reverseLightDirection );
                var len = Math.pow(reverseLightDirection[0]*reverseLightDirection[0]+reverseLightDirection[1]*reverseLightDirection[1]+reverseLightDirection[2]*reverseLightDirection[2],0.5);
                //var light = dot( reverseLightDirection, normal );
                var light = this.dot( reverseLightDirection, normal )/len;

                //this.imageData.data[ index * 4 ] = Math.min( 255, ( this.pointLight.color.r + this.plane.color.r ) * light );
                //this.imageData.data[ index * 4 + 1 ] =  Math.min( 255, ( this.pointLight.color.g + this.plane.color.g ) * light );
                //this.imageData.data[ index * 4 + 2 ] =  Math.min( 255, ( this.pointLight.color.b + this.plane.color.b ) * light );

                this.imageData.data[ index * 4 ] = Math.min( 255, ( this.pointLight.color.r) * light );
                this.imageData.data[ index * 4 + 1 ] =  Math.min( 255, ( this.pointLight.color.g) * light );
                this.imageData.data[ index * 4 + 2 ] =  Math.min( 255, ( this.pointLight.color.b) * light );

                // this.imageData.data[ index * 4 ] = Math.min( 255, ( this.pointLight.color.r ) * light+ this.plane.color.r  );
                // this.imageData.data[ index * 4 + 1 ] =  Math.min( 255, ( this.pointLight.color.g  ) * light+ this.plane.color.g );
                // this.imageData.data[ index * 4 + 2 ] =  Math.min( 255, ( this.pointLight.color.b ) * light + this.plane.color.b );
                this.imageData.data[ index * 4 + 3 ] = 255* light;
            }
        }
        
    },
    animate:function(){ 
        light.render();
        light.draw();
        if(!light.stop){
            window.requestAnimationFrame(light.animate, light.canvas);
        }
    },
    draw:function(){
        light.ctx.putImageData( light.imageData, 0, 0 ); 
    },
    /**
     * 两向量相减
     * @param {Array<number>} v1
     * @param {Array<number>} v2
     * @return {Array<number>}
     */
    sub:function( v1, v2 ) {
        return [
            v1[ 0 ] - v2[ 0 ],
            v1[ 1 ] - v2[ 1 ],
            v1[ 2 ] - v2[ 2 ]
        ]
    },
    //向量数量积的几何意义是：一个向量在另一个向量上的投影
    /**
     * 点乘运算
     * @param {Array<number>} v1 向量v1
     * @param {Array<number>} v2 向量v2
     * @return {number} 点乘结果
     */
    dot:function( v1, v2 ) {
        return v1[ 0 ] * v2[ 0 ] + v1[ 1 ] * v2[ 1 ] + v1[ 2 ] * v2[ 2 ];
    },
    /**
     * 将向量转为单位向量
     * @param {Array<number>} v
     * @return {Array<number>} 单位向量
     */
    normalize:function( v ) {
        var len = 2* Math.sqrt( v[ 0 ] * v[ 0 ] +  v[ 1 ] * v[ 1 ] +  v[ 2 ] * v[ 2 ] );
        return [
            v[ 0 ] / len,
            v[ 1 ] / len,
            v[ 2 ] / len
        ];
    },
    //反向量
    negate:function(v){
        return [
            -v[0],
            -v[1],
            -v[2]
        ]
    },
    
}