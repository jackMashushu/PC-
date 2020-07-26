function ajax(options){
    //判断URL的合法性
    if(!options.url){
        throw new Error('请填写URL！');        
    };
    //判断type的合法性
    if(typeof options.type==='string'||options.type===undefined){
        if(!(options.type===undefined||options.type.toUpperCase()==='POST'||options.type.toUpperCase()==='GET'||options.type==='')){
            throw new Error('type只支持POST/GET!');
        };
    }else{
        throw new Error('type只支持POST/GET!');
    };
    //判断async是否异步
    if(!(typeof options.async==='boolean'||options.async===undefined)){
        throw new Error('async只接受布尔数据!');
    };
    //判断数据类型，是否信息JASON.parse
    if(!(typeof options.dataType==='boolean'||options.dataType===undefined)){
        throw new Error('dataType只接受布尔数据!');
    };
    //这里只接收data数据格式为字符串或者对象，判断、方法：Object.prototype.toString.call（……）适合检测对象数据类型
    if(!(typeof options.data==='string'||options.data===undefined||Object.prototype.toString.call(options.data)==='[object Object]')){
        throw new Error('data只接受对象或字符串!');
    };
    //判断回调函数是否合法
    if(!(options.ajaxFun===undefined||Object.prototype.toString.call(options.ajaxFun)==='[object Function]')){
        throw new Error('请填写正确的回调函数!');
    };
    const _defaut={
        url:options.url,
        type:options.type?options.type:'GET',
        async:typeof(options.async)==='boolean'?options.async:true,
        dataType:typeof(options.dataType)==='boolean'?options.dataType:false,
        data: typeof(options.data)==='string'?options.data:'',
        ajaxFun:options.ajaxFun?options.ajaxFun:function(){},
    };
    if(Object.prototype.toString.call(options.data)==='[object Object]'){
         let str='';
         for(let attr in options.data){
             str+=attr+'='+options.data[attr]+'&';
         }
         //方法：+字符串.str.slice(开始索引,结束索引)截掉最后一个多余的&
         _defaut.data=str.slice(0,str.length-1);
    };
    let xhr;
    if(XMLHttpRequest){
        xhr=new XMLHttpRequest();
    }else{
        xhr=new ActiveXObject('Microsoft.XMLHTTP');
    };
    xhr.open(_defaut.type,_defaut.url+`${_defaut.type.toUpperCase()==='GET'?'?'+_defaut.data:''}`,_defaut.async);
    xhr.onreadystatechange = function(){
        if(xhr.readyState===4&&/^2\d{2}$/.test(xhr.status)){
            if(_defaut.dataType){
                //回调函数，这里执行
                _defaut.ajaxFun(JSON.parse(xhr.responseText));               
            }else{
                _defaut.ajaxFun(xhr.responseText);
            };
        };
    };
    if(_defaut.type.toUpperCase()==='POST'){
        xhr.setRequestHeader('content-type','application/x-www-form-urlencoded')
    };
    xhr.send(_defaut.type==='GET'?null:_defaut.data);
   };
//利用promise构造函数封装ajax
function promise_ajax(options){
  return new Promise(function(resolve,regect){
      options.ajaxFun=function(res){
          resolve(res);
      };
      ajax(options);
  });
};
/*
用法，只需要不断调用并接.then即可
例如在html中：
promise_ajax({
    这里填写需要的options对象成员
})
.then(function(res){
   return promise_ajax({
       这里填写需要的options对象成员
   })
})
.then(一直循环即可)
 */