// 渲染分页器需要传入的对象
const contents=document.querySelector('.content');
const listInfo={
    pageNum:3,
    pageSize:5,
}
const pageInfo={   
        total:0,
        pagenum:listInfo.pageNum,
        pagesize:listInfo.pageSize,
        pageChange:(num)=>{
            listInfo.pageNum=num
            getList();
            },  
}
// 获取数据库总数
getTotal()
//先把总的页数请求过来，渲染分页器
function getTotal(){
    ajax({
        url:'../server/total.php',
        dataType:true,
        ajaxFun:function(res){
            pageInfo.total=res.total;
            const p1=new Pagination('#pagi',pageInfo); 
            p1.init();

       }
    })
    
}
//获取页面数据库的信息
function getList(){
   ajax({
        url:'../server/list.php',
        dataType:true,
        data:listInfo,
        ajaxFun:function(res){
            console.log(res)
            let str=``;
            res.forEach(item=>{
                str+=`
                <div class="img-box">
                   <img src="${item.url}" alt="">
                   <p>${item.name}</p>
                   <a href="./detail.html?id=${item.Id}" class="change">详情</a>
                </div>
                `;
            })
            contents.innerHTML=str;
       }, 
    })   
}
