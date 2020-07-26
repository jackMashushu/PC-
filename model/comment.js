const mongoose=require('mongoose');
const commSchema=new mongoose.Schema({
    atcId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Article'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    time:{
        type:Date
    },
    content:{
        type:String,
        maxlength:200
    },
    isRead:{
        type:Boolean,
        default:false
    }
});
//匿名留言
const leaveSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:String,
        maxlength:12,
        minlength:1
    },
    time:{
        type:Date,
        default:Date.now
    },
    isRead:{
        type:Boolean,
        default:false
    }
});
const Leave=mongoose.model('Leave',leaveSchema);
const Comment=mongoose.model('Comment',commSchema);
module.exports={
    Comment:Comment,
    Leave:Leave
}