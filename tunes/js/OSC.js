//====the O(id) function===
function O(id){
  if( typeof id == 'object' ){
    return id;
  }
  else{
    return document.getElementById(id);
  }
}
//=====the S(obj) function for style
function S(obj){
    return O(obj).style;
}
//===the C(className) function for class array=====
function C(className){
  var objects = document.getElementsByTagName('*');
  var classArray = [];
  for(var i=0; i<objects.length; i++){
    if(objects[i].className === className){
      classArray.push(objects[i]);        
    }
  }
  return classArray;
}
//=================================================







