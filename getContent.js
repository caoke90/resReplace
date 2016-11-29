var fs=require("fs")
var Iconv = require('iconv-lite');
var Wind=require("wind")
var request = require('./request')

var getContent=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {
    if(/^https?:\/\//.test(pathOrUrl)){
        request(pathOrUrl, function (error,response,data) {
            if(!error) {
                var body=data.toString();
                if (/gb(2312|k)/i.test(response.headers['content-type'])||/<meta .*?charset=(["']?)gb(2312|k|18030)\1?/gi.test(body)||/encoding="gbk"/gi.test(body)) {
                    body = Iconv.decode(data, 'gb2312').toString()
                }
                callback(body)
            }else{
                console.error(error)
                callback("")
            }
        })
    }else{
        var buf=fs.readFileSync(pathOrUrl)
        callback(buf.toString());
    }

})
module.exports=getContent;

