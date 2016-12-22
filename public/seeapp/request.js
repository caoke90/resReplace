var fs=require("fs")
var Iconv = require('iconv-lite');
var Wind=require("wind")
var request =module.exports= require('request').defaults({
    encoding: null,
    headers:{
        cookie:"vLqc_2132_auth=87f9Fwemn0NXgUle%2FG11eYCpiGUIARQKOd7ych8mzk%2BB1PqWnpdMkFM%2FEZXs1gXL%2FN0Z%2FpsaaGc5Otyv3ANljjxJ;vLqc_2132_clearUserdata=forum;vLqc_2132_creditbase=0D0D89889D0D40179D0D0D0D0;vLqc_2132_creditnotice=0D0D50D0D20D0D0D0D0D6903;vLqc_2132_creditrule=%E5%8F%91%E8%A1%A8%E5%9B%9E%E5%A4%8D;vLqc_2132_forum_lastvisit=D_52_1481987786;vLqc_2132_lastact=1481988408%09forum.php%09;vLqc_2132_lastcheckfeed=6903%7C1481295438;vLqc_2132_lastvisit=1481291063;vLqc_2132_lip=1.180.215.89%2C1481987367;vLqc_2132_nofavfid=1;vLqc_2132_saltkey=W5fE0GXk;vLqc_2132_sid=k9UbN0;vLqc_2132_st_p=6903%7C1481988375%7Cfb04ca85eb37530eaed906b593889e06;vLqc_2132_st_t=6903%7C1481987786%7C71181e5729549666af887556bb567906;vLqc_2132_ulastactivity=4e25sw25E3o3oJzvoInl%2FeI3iAJS1i%2B7juk2NO8dXEsepG6rFLuL;vLqc_2132_viewid=tid_111777;vLqc_2132_visitedfid=79D52D54;",
        'User-Agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5'
    }
});

request.getContent=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {
    if(/^https?:\/\//.test(pathOrUrl)){
        request(pathOrUrl, function (error,response,data) {
            if(!error) {
                var body=data.toString();
                if (/gb(2312|k)/i.test(response.headers['content-type'])||/<meta .*?charset=(["']?)gb(2312|k|18030)\1?/gi.test(body)||/encoding="gbk"/gi.test(body)) {
                    body = Iconv.decode(data, 'gb2312').toString()
                }
                callback(body)
            }else{
                callback("")
            }
        })
    }else{
        var buf=fs.readFileSync(pathOrUrl)
        callback(buf.toString());
    }

})

request.postGbk=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {

    request.post(pathOrUrl, function (error,response,data) {
        if(!error) {
            var body=data.toString();
            if (/gb(2312|k)/i.test(response.headers['content-type'])||/<meta .*?charset=(["']?)gb(2312|k|18030)\1?/gi.test(body)||/encoding="gbk"/gi.test(body)) {
                body = Iconv.decode(data, 'gb2312').toString()
            }
            callback(body)
        }else{
            callback("")
        }
    })
})

request.getBase64=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {
    var selfFunc=arguments.callee
    request(pathOrUrl, function (error,response,data) {
        var html=data.toString()
        //防止爬虫
        if(/<html><body><script/.test(html)){
            console.log("反爬虫")
            console.log(html)
            var other={
                window:{}
            }
            with(other){
                eval(/<script language="javascript">([\d\D]+)<\/script>/.exec(html)[1])
            }
            if(typeof other.window.location=="string"){
                var cururl="http://www.168ytt.com"+other.window.location
                selfFunc(cururl,callback)
            }else{
                throw "error";
            }

            return;
        }
        if(!error) {
            var type=response.headers["content-type"]
            var prefix="data:"+type+";base64,";
            var base64=data.toString("base64")
            var body=prefix+base64
            callback(body)
        }else{
            callback("")
        }
    })
})