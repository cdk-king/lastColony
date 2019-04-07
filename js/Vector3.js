//三维向量
    //构造函数模式
    var Vector3 = function(x, y, z) { 
        this.x = x; 
        this.y = y; 
        this.z = z;
    };

    Vector3.prototype = {
        copy:function(){
            return new Vector3(this.x, this.y, this.z);
        },
        length:function(){
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        sqrLength:function(){
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },
        normalize:function(){
            //单位向量
            var inv = 1/this.length(); 
            return new Vector3(this.x * inv, this.y * inv, this.z * inv);
        },
        negate:function(){
            //反向量
            return new Vector3(-this.x, -this.y, -this.z);
        },
        add:function(v){
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        },
        subtract:function(v){
            return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        },
        multiply:function(f){
            //乘
            return new Vector3(this.x * f, this.y * f, this.z * f);
        },
        divide:function(f){
            //除
            var invf = 1/f;
             return new Vector3(this.x * invf, this.y * invf, this.z * invf);
        },
        dot:function(v){
            //点积
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },
        cross:function(v){
            //叉积
            //向量积，数学中又称外积、叉积，物理中称矢积、叉乘，是一种在向量空间中向量的二元运算。与点积不同，它的运算结果是一个向量而不是一个标量。并且两个向量的叉积与这两个向量和垂直。
            return new Vector3(-this.z * v.y + this.y * v.z, this.z * v.x - this.x * v.z, -this.y * v.x + this.x * v.y);
        } 
    }
    Vector3.zero = new Vector3(0, 0, 0);