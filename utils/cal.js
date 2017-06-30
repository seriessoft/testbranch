var Firebase = require('firebase');

var checkLabel = function(userId,callback){
  var userRef = Firebase.database().ref().child('users').child(userId);
  var level = [
    {'id':1,'value':0,'reward':30},{'id':2,'value':3,'reward':30},
    {'id':3 ,'value':4,'reward':30},{'id':4 ,'value':6,'reward':30},
    {'id':5 ,'value':8,'reward':30},{'id':6 ,'value':12,'reward':100},
    {'id':7 ,'value':16,'reward':100},{'id':8 ,'value':23,'reward':100},
    {'id':9 ,'value':32,'reward':100},{'id':10 , 'value':44,'reward':100},
    {'id':11 , 'value':62,'reward':200},{'id':12 , 'value':87,'reward':200},
    {'id':13 , 'value':121,'reward':200},{'id':14 , 'value':170,'reward':200},
    {'id':15 , 'value':238,'reward':200},{'id':16 , 'value':333,'reward':500},
    {'id':17 , 'value':467,'reward':500},{'id':18 , 'value':653,'reward':500},
    {'id':19 , 'value':915,'reward':500},{'id':20 , 'value':1281,'reward':500},
    {'id':21 , 'value':1793,'reward':1000},{'id':22 , 'value':2510,'reward':1000},
    {'id':23 , 'value':3514,'reward':1000},{'id':24 , 'value':4920,'reward':1000},
    {'id':25 , 'value':6888,'reward':1000},{'id':26 , 'value':9643,'reward':2000},
    {'id':27 , 'value':13500,'reward':2000},{'id':28 , 'value':18899,'reward':2000},
    {'id':29 , 'value':26459,'reward':2000},{'id':30 , 'value':37043,'reward':2000},
    {'id':31 , 'value':51860,'reward':5000},{'id':32 , 'value':72604,'reward':5000},
    {'id':33 , 'value':101646,'reward':5000},{'id':34 , 'value':142304,'reward':5000},
    {'id':35 , 'value':199226,'reward':5000},{'id':36 , 'value':278917,'reward':100000},
    {'id':37 , 'value':390483,'reward':100000},{'id':38 , 'value':546677,'reward':100000},
    {'id':39 , 'value':765347,'reward':100000},{'id':40 , 'value':1071486,'reward':100000},
    {'id':41 , 'value':1500081,'reward':1000000},{'id':42 , 'value':2100113,'reward':1000000},
    {'id':43 , 'value':2940158,'reward':1000000},{'id':44 , 'value':4116222,'reward':1000000},
    {'id':45 , 'value':5762710,'reward':1000000},{'id':46 , 'value':8067794,'reward':10000000},
    {'id':47 , 'value':11294912,'reward':10000000},{'id':48 , 'value':15812877,'reward':10000000},
    {'id':49 , 'value':22138028,'reward':10000000},{'id':50 , 'value':30993239,'reward':10000000}
  ];
  userRef.once('value',function(snapshot){
    var result = snapshot.val();
    var a = false;
    var abc = [];
    for(var i=result.label;i<50;i++)
    {
      var j = parseInt(i+1);
      abc[i]=result.xp;
      //break;
      if(result.xp >= level[j].value)
      {
        result.xp 	= parseInt(result.xp-level[j].value);
        result.label = parseInt(result.label+1);
        result.coin = parseInt(result.coin+level[j].reward);
        a = true;
      }
      else
      {
        if(a){
          break;
        }
      }

    }
    if(a){
      userRef.set(result);
	  callback(result);
  }else{
	  callback({success:false});
  }

  });
};

module.exports = {
  checkLabel:checkLabel
};
