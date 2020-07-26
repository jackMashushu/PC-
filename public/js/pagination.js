function Pagination(id,options){
    this.ele=document.querySelector(id) 
    //判断是否传入了页面数据，总数，每页多少，分页数,标签文字等
     if(options===undefined){
         options={}
     }
     if(options.pagesize===undefined){
         options.pagesize=10
     }
    if(options.total===undefined){
        options.total=200
    }
    if(options.first===undefined){
        options.first='首页'
    }
    if(options.prev===undefined){
        options.prev='上页'
    }
    if(options.next===undefined){
        options.next='下页'
    }
    if(options.last===undefined){
        options.last='末页'
    }
    if(options.pageChange===undefined){
        options.pageChange=function(num){
            console.log('更换到'+num+'页')
        }
        this.pageChange=options.pageChange
    } 
        this.pageChange=options.pageChange
    this.pageInfo={
        pagenum:1,
        //每页放多少数据
        pagesize:options.pagesize,
        total:options.total,
    }  //渲染页面的参数
    this.textInfo={
        first:options.first,
        prev:options.prev,
        list:'',
        next:options.next,
        last:options.last,
    }
    this.list=null
}
Pagination.prototype.init=function(){
    this.computedTotalPage()
    this.creatEle()
    this.setEleStyle()
    this.creatGo()
    this.creatPagelist()
    this.isDisable()
    this.pagiMove()
} //启动器
Pagination.prototype.computedTotalPage=function(){
    this.pageInfo.totalPage=Math.ceil(this.pageInfo.total/this.pageInfo.pagesize)
}
Pagination.prototype.creatEle=function(){
    const frg=document.createDocumentFragment()
    for(let Attr in this.textInfo){
       let div=document.createElement('div')
       if(Attr==='list'){
        setCss(div,{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',   //注意大写  
            cursor:'pointer',         
        })
         this.list=div   //把div赋值给上文的list变量
       }else{ setCss(div,{
        // border:'2px solid #333',
        borderRadius:'5px',
        padding:'0 5px',
        margin:'0 3px',
        cursor:'pointer', 
        fontWeight:'bold',
        color:'rgba(42,70,83,.7)'
    })
}
       div.innerHTML=this.textInfo[Attr]
       div.className=Attr
       frg.appendChild(div)
    }
    this.ele.appendChild(frg)
}
Pagination.prototype.setEleStyle=function(){
    setCss(this.ele,{       
        display:'flex',
        justifyContent:'center',
        alignItems:'center',   //注意大写
    })
}
Pagination.prototype.creatGo=function(){   
    const inp=document.createElement('input')
    const btn=document.createElement('button')
    setCss(inp,{
        outLine:'none',
        height:'19px',
        width:'40px',
        borderRadius:'5px',
        border:'1px solid gray'
    })
    setCss(btn,{
        height:'25px',
        width:'50px',
        margin:'0 3px',
        cursor:'pointer',
        borderRadius:'5px',
        outline:'none',
        border:'none',
        fontSize:'14px',
        fontWeight:'bold',
    })
    inp.value=this.pageInfo.pagenum
    inp.type='number'
    btn.innerHTML='跳转'
    this.ele.appendChild(inp)
    this.ele.appendChild(btn)   
}
Pagination.prototype.creatPagelist=function(){
  let frg=document.createDocumentFragment()
  let totalPage=this.pageInfo.totalPage
  const pagenum=this.pageInfo.pagenum
  if(totalPage<=9){for(i=1;i<=totalPage;i++){
      const p=creatP(i,pagenum)//函数写在下文，更精简
      frg.appendChild(p)
  }
  }
  else{
    if(pagenum<5){
        for(i=1;i<=5;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span=document.createElement('span')
        span.innerHTML='...'
        frg.appendChild(span)
        for(i=totalPage-1;i<=totalPage;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
    }
    if(pagenum===5){
        for(i=1;i<=7;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span=document.createElement('span')
        span.innerHTML='...'
        frg.appendChild(span)
        for(i=totalPage-1;i<=totalPage;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
    }
    if(pagenum>5&&pagenum<totalPage-4){
        for(i=1;i<=2;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span=document.createElement('span')
        span.innerHTML='...'
        frg.appendChild(span)
        for(i=pagenum-2;i<pagenum+2;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span2=document.createElement('span')
        span2.innerHTML='...'
        frg.appendChild(span2)
        for(i=totalPage-1;i<=totalPage;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
    }
    if(pagenum===totalPage-4){
        for(i=1;i<=2;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span=document.createElement('span')
        span.innerHTML='...'
        frg.appendChild(span)
        for(i=totalPage-6;i<=totalPage;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
    }
    if(pagenum>totalPage-4){
        for(i=1;i<=2;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
        const span=document.createElement('span')
        span.innerHTML='...'
        frg.appendChild(span)
        for(i=totalPage-4;i<=totalPage;i++){
            const p=creatP(i,pagenum)
            frg.appendChild(p)
        }
    }
  }
  this.ele.children[5].value=pagenum
  this.list.innerHTML=''//每次执行都让它空，否则会重复添加
  this.list.appendChild(frg)
  //切换页面
  this.pageChange(pagenum)
} 
Pagination.prototype.isDisable=function(){
     if(this.pageInfo.pagenum===1){
         this.ele.children[0].style.backgroundColor='rgb(222, 22, 21,.1)'
         this.ele.children[1].style.backgroundColor='rgb(222, 22, 21,.1)'
     }else{
        this.ele.children[0].style.backgroundColor='transparent'
        this.ele.children[1].style.backgroundColor='transparent'
     }
     if(this.pageInfo.pagenum===this.pageInfo.totalPage){
        this.ele.children[3].style.backgroundColor='rgb(222, 22, 21,.1)'
        this.ele.children[4].style.backgroundColor='rgb(222, 22, 21,.1)'
    }else{
        this.ele.children[3].style.backgroundColor='transparent'
        this.ele.children[4].style.backgroundColor='transparent'
     }
} 
Pagination.prototype.pagiMove=function(){
     //由于所有的元素都是动态添加的，事件委托绑定事件会更简单
     this.ele.addEventListener('click',(e)=>{
         e=e||window.event
         const target=e.target||e.srcElement
         if(target.className==='first'&&this.pageInfo.pagenum!==1){
            this.pageInfo.pagenum=1
            this.creatPagelist()
            this.isDisable()
         }
         if(target.className==='prev'&&this.pageInfo.pagenum!==1){
            this.pageInfo.pagenum--
            this.creatPagelist()
            this.isDisable()
          }
          if(target.className==='next'&&this.pageInfo.pagenum!==this.pageInfo.totalPage){
            this.pageInfo.pagenum++
            this.creatPagelist()
            this.isDisable()

          }
          if(target.className==='last'&&this.pageInfo.pagenum!==this.pageInfo.totalPage){
            this.pageInfo.pagenum=this.pageInfo.totalPage
            this.creatPagelist()
            this.isDisable()
          }
          if(target.tagName==='P'&&this.pageInfo.pagenum!==target.innerHTML-0){
            this.pageInfo.pagenum=target.innerHTML-0  //innerHTML可读可写，-0是因为拿到的是字符串
            this.creatPagelist()
            this.isDisable()
          }
          if(target.tagName==='BUTTON'){
            let value=target.previousElementSibling.value-0
            if(value<=1){
                value =1
            }if(value>=this.pageInfo.totalPage){
                value=this.pageInfo.totalPage
            }
            this.pageInfo.pagenum=value
            this.creatPagelist()
            this.isDisable()
            target.previousElementSibling.value=value
          }
     })
} 
function setCss(ele,style){
      for(let Attr in style){
         ele.style[Attr]=style[Attr]  
      }
}
function creatP(i,pagenum){
    const p=document.createElement('p')
      setCss(p,{
          border:'1px solid rgb(232, 232, 232)',
          margin:'0 4px',
          padding:'0 10px',
          borderRadius:'3px',
          fontWeight:'bold'
      })
      if(i===pagenum){
        p.style.backgroundColor='orange'
    }
      p.innerHTML=i
      return p
}