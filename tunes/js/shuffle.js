/////////////////////////////////////////////
function removeArrayMember(array, index){
    if(index < array.length && array.length > 0){        
        return removeMember(array, index);
    }
    else{
        return false;  
    }
    //====== helper function ======
    function removeMember(array, index){
        for(var i=0; i< index ; i++){
            var top = array.shift();
            array.push(top);
        }
        return array.shift();
    }
    //=============================
}
////////////////////////////////////////////