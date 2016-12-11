var parseTpl=require("./parseTpl")

var fs=require("fs")
var path=require("path")


function render(filepath,root,gloCallback){
    var p1=/__include\((.+?)\)/g;
    //解析<%include("./test.html")%>
    var _super=function(content,filepath,callback){
        var ncontent=content
        if(p1.test(content)){
            var progress=0;
            content.replace(p1,function(m,p1){
                ++progress;
                var path1=p1.replace(/["']/g,"");
                var dirname=path.dirname(filepath)
                var filepath1=path.join(dirname,path1)
                setTimeout(function(){
                    solve(filepath1,function(content,filepath){
                        _super(content,filepath,function(content2){
                            ncontent=ncontent.replace(m,content2)
                            if(--progress==0){
                                callback(ncontent)
                            }
                        })
                    })
                },0)
            });
        }else{
            callback(ncontent)
        }
    }
    //解析模块
    function solve(filepath,callback){
        var param=path.parse(filepath)
        var jspath=path.join(param.dir,param.name+".js")

        var content=fs.readFileSync(filepath).toString();
        if(fs.existsSync(jspath)) {
            var sp = require(jspath)
            sp.render(function(data){
                content=parseTpl(content,data)
                callback(content,filepath)
            },root)
        }else{
            callback(content,filepath)
        }
    }

    solve(filepath,function(content,filepath){
        _super(content,filepath,gloCallback)
    })


}
module.exports=render;