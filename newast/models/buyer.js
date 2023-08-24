const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const BuyerSchema=new Schema({
  name:String,
  price:Number,
  image: String,
  sellername:String,
  pnenum:Number
});

module.exports=mongoose.model('Buyer',BuyerSchema);
