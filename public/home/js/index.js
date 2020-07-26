console.log('succeed');
//新闻展示区域
$('.title-box>li').mouseover(function(){           
    $('.title-box>li').removeClass('active');
    $(this).addClass('active');

    $('.mes-container>li').removeClass('active')
    .eq($(this).index()).addClass('active');            
})
//新闻模块卡片切换
$('.show-article').on("mouseenter mouseleave","li",function(event){
    if(event.type == "mouseenter"){
        $('#defaul-card-show').css('display','none');
        $('#defaul-sim-show').css('display','flex');
        $(this).find('.article-card').css('display','flex');
        $(this).find('.article-show-sim').css('display','none');
       　　　　
        }else if(event.type == "mouseleave"){
        $(this).find('.article-card').css('display','none');
        $(this).find('.article-show-sim').css('display','flex');
        };
})
$('.show-article').mouseleave(function(){
    $('#defaul-card-show').css('display','flex');
    $('#defaul-sim-show').css('display','none'); 
});
$('.show-article').on('click','img',function(){
    window.open('http://localhost/home/detail.html?id='+$(this).attr('index'),'_blank');
})

  //图片hover效果
  $('.left-pic-box').on('mouseover','.backdrop',function(){
    $(this).css('display','none')
    .next().css('display','none');
  }).on('mouseleave','.left-pic-a',function(){
    $('.backdrop').css('display','block')
     .next().css('display','block');
  })

    // 文章列表展开效果
    $('.newslist').on("mouseenter mouseleave","li",function(event){
        if(event.type== "mouseenter"){
            $('.article-first-model').css('height','30px')
        }else if(event.type== "mouseleave"){
            $('.article-first-model').css({
                  border: '1px solid rgb(247, 247, 247)',
                  backgroundColor: 'rgb(247, 247, 247)',
                  height:' 100px',
                  transition: 'all .3s linear'
                });
        }
    })


// 盒子固定

window.addEventListener('load',function(){
    const flag=$('#right-little-block').offset().top;
    $(document).scroll(function(){ 
        const Y=flag-$(window).scrollTop();
        if(Y<0){
           $('#right-little-block').css({
               top:$(window).scrollTop()-flag,
           });           
        }else{
           $('#right-little-block').css('top',0);
        } 
        
   });
})





//运动组件
function move(ele,target,cb){
    let timerObj={}  
    for(let attr in target){
        timerObj[attr]=setInterval(()=>{
            let current
            if(attr==='opacity'){
                current=getComputedStyle(ele)[attr]*100  
            }else{
                current=parseInt(getComputedStyle(ele)[attr])
            }           
            let distance=(target[attr]-current)/10 
            distance=distance>0?Math.ceil(distance):Math.floor(distance)  
          if(current===target[attr]){
            clearInterval(timerObj[attr])
            delete timerObj[attr]
            const res=getObjLength(timerObj)
            if(res===0){
                cb()
            }
        }else{
            if(attr==='opacity'){
                ele.style[attr]=(current+distance)/100
                
            }else{
                ele.style[attr]=current+distance+'px'
            }
        }
        },20)

    }
}
function getObjLength(obj){
    n=0
    for(let attr in obj){
        n++
    }
    return n
}
// 轮播组件
class Banner{
    constructor(id){
         this.ele=document.querySelector(id)
         this.imgBox=this.ele.querySelector('ul')
         this.pointBox=this.ele.querySelector('ol')
         this.windowWidth=this.ele.clientWidth
         this.leftRight=this.ele.querySelector('.leftright')
         this.timerLoop=null
         this.flag=true
         this.index=1
         this.bannerInit()
    }
    bannerInit(){
        this.setPoint()
        this.copyEle()
        clearInterval(this.timerLoop)
        this.autoPlay()
        this.overout()
        this.leftRightC()
        this.pointClick()
    }
    setPoint(){
        const pointNum=this.imgBox.children.length
        const frg=document.createDocumentFragment()
        for(let i=0;i<pointNum;i++){
           const li=document.createElement('li')
           li.setAttribute('index',i)
           if(i===0){
               li.className='active'
           }
           frg.appendChild(li)
        }
        this.pointBox.appendChild(frg)
        this.pointBox.style.width=pointNum*20*2+'px'
    }
    copyEle(){
        const first=this.imgBox.firstElementChild.cloneNode(true)
        const last=this.imgBox.lastElementChild.cloneNode(true)
        this.imgBox.appendChild(first)
        this.imgBox.insertBefore(last,this.imgBox.firstElementChild)
        this.imgBox.style.width=this.windowWidth*this.imgBox.children.length+'px'
        this.imgBox.style.left=-1*this.windowWidth+'px'        
    }
    autoPlay(){
        this.timerLoop=setInterval(()=>{
            this.index++
            move(this.imgBox,{left:-this.index*this.windowWidth},this.moveEnd.bind(this))},3000
        )
   }
   overout(){
       this.ele.addEventListener('mouseover',()=>{
           clearInterval(this.timerLoop)
       })
       this.ele.addEventListener('mouseout',()=>{
        this.autoPlay()
    })
    //如果离开页面，则停止轮播
      document.addEventListener('visibilitychange',()=>{
        var isHidden = document.hidden;       
        if(isHidden){       
        clearInterval(this.timerLoop)       
        } else {        
            this.autoPlay()
        }
        }
        )         
   }
   leftRightC(){
       this.leftRight.addEventListener('click',(e)=>{
          e=e||window.event
          const target=e.target||e.srcElement
          if(this.flag===false){
              return
          }
          this.flag=false
          if(target.className==='left'){
            this.index--
            move(this.imgBox,{left:-this.index*this.windowWidth},this.moveEnd.bind(this))
          }
          if(target.className==='right'){
            this.index++
            move(this.imgBox,{left:-this.index*this.windowWidth},this.moveEnd.bind(this))
          }
       })
   }
   pointClick(){
    this.pointBox.addEventListener('click',(e)=>{
         e=e||window.event
         const target=e.target||e.srcElement
         if(this.flag===false){
            return
        }
        this.flag=false
         if(target.tagName==='LI'){
             const i=target.getAttribute('index')-0+1
             this.index=i
             move(this.imgBox,{left:-this.index*this.windowWidth},this.moveEnd.bind(this))

         }
    })
}
        moveEnd(){
        if(this.index===this.imgBox.children.length-1){
            this.index=1
            this.imgBox.style.left=-this.index*this.windowWidth+'px'
        }
        if(this.index===0){
            this.index=this.imgBox.children.length-2
            this.imgBox.style.left=-this.index*this.windowWidth+'px'
        }
        for(let i=0;i<this.pointBox.children.length;i++){
            this.pointBox.children[i].className=''
        }
        this.pointBox.children[this.index-1].className='active'
        this.flag=true        
    }
      
}


//左侧导航点击事件
     
     const rightBox=document.querySelectorAll('.list-box>a');
     rightBox.forEach(function(item,index){
         item.addEventListener('mouseover',function(){
             this.firstElementChild.style.display='block';
         });
         item.addEventListener('mouseout',function(){
             this.firstElementChild.style.display='none';
         });
     });



// 分页器
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

//获取cookie
function getCookie(key){
    var value=''
    var co=document.cookie
    const tmpArr=co.split('; ')
    tmpArr.forEach(item=>{
       var tmp=item.split('=')
       if(tmp[0]===key){
           value=tmp[1]
       }
    })
    return value
}















