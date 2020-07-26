function DataSimp(pram){
    //serializeArray()方法获取form表单中的所有输入控件信息
    //返回值：[{key(name):value(value)},有多少控件就有多少对象]
    let f=pram.serializeArray();
    let loginData={};
    f.forEach((item,index)=>{
        loginData[item.name]=item.value;
    });
    return loginData;
}