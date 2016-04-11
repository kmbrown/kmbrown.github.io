/**
* Author: Abbas Abdulmalik
* Creation Date: March 16, 2016
* Revised: March 17, 2016
* Project Name: module.js
* Purpose:  Attempt to make a simple commonJS-like module
            with jQuery-like functionality
* Notes:
*
*/
exports = main;
function main(param){
  setElementOrArray(param);
  return main;
}
var base = 'https://dl.dropboxusercontent.com/u/21142484/modules/';
var $ = rekwire(base + "aQuery.js");
var elem = {};
var array = [];
var toggleOn = true;    // Flag for an element's toggle method.
var arrayToggleOn = []; // Flags for array objects' toggle method.

//===| exposed data and methods |===

//-------importing from aQuery ($)-----
main.makeDraggable = $.makeDraggable;
main.symDiff = $.sym;
main.sizeFactory = $.liquidPixelFactory;
//------------------
main.getElement = function getElement(){
    return elem;
}
main.elem = main.getElement;

main.getArray = function getArray(){
    return array;
}
main.array = main.getArray;

main.html = function html(string){
    if(elem !== null){
        elem.innerHTML = string;
    }
    else if(array.length !== 0){
        array.forEach(function(m){
            m.innerHTML = string;
        });
    }
    return exports;
};

main.addHtml = function addHtml(string){
    if(elem !== null){
        elem.innerHTML += string;
    }
    else if(array.length !== 0){
        array.forEach(function(m){
            m.innerHTML += string;
        });
    }
    return exports;
};

main.click = function click(handler){
    //elem.addEventListener("click",handler);
    if(elem !== null){
        elem.addEventListener("click", handler);
    }
    else if(array.length !== 0){
        array.forEach(function(m){
            m.addEventListener("click", function(e){
                handler(e, m);
            });
        });
    }
    return exports;
};

main.on = function on(event, handler){
    if(elem !== null){
        elem.addEventListener(event, handler);
    }
    else if(array.length !== 0){
        array.forEach(function(m){
            m.addEventListener(event, function(e){
                handler(e, m);
            });
        });
    }
    return exports;
};

main.toggle = function toggle(onHandler, offHandler){
//global toggleOn variable starts true;
    if(elem !== null){
    	elem.onclick = function(e){
          if(toggleOn){
            onHandler(e);
            toggleOn = false;
          }
          else{
            offHandler(e);
            toggleOn = true;
          }
          e.stopPropagation();
        };//---END of element.onclick method
    }
    else if(array.length !== 0){
    	array.forEach(function(m,i){
          m.onclick = function(e){
            if(arrayToggleOn[i]){
              onHandler(e,m);
              arrayToggleOn[i] = false;
            }
            else{
              offHandler(e,m);
              arrayToggleOn[i] = true;
            }
            e.stopPropagation();
          };
        });
    }
    return exports;
};//---END of toggle() method

main.hover = function hover(overHandler, outHandler){
	if(elem !== null){
    	elem.onmouseover = overHandler;
        elem.onmouseout = outHandler;
    }
    else if(array.length !== 0){
        array.forEach(function(m){
          m.onmouseover = function(e){
                overHandler(e,m);
          };
          m.onmouseout = function(e){
                outHandler(e,m);
          };
        });
    }
    return exports;
};
main.overAndOut = main.hover;

main.css = function css(property, value){
  if(elem !== null){
    elem.style[property] = value;      
  }
  else if(array.length !== 0){
    array.forEach(function(m){
      m.style[property] = value;
    });
  }
  return exports;
};
main.style = main.css;//style (singular, not styles) being made an alias for css method

main.styles = function styles(property, value){
  //styles will return itself for chaining  
  if(elem !== null){
    e(property, value); 
  }
  else if(array.length !== 0){
    a(property, value)
  }
  //----helper---
  function e(p,v){
     elem.style[p] = v;
  }
  function a(p,v){
    array.forEach(function(m){
        m.style[p] = v;
    });      
  }
  //-----------
  return styles;//returns itself for chaining    
 };

main.get = function get(url, handler){
  try{
    var ajax = new XMLHttpRequest();
    ajax.open("GET", url);
    ajax.send();
    //-----
    ajax.onload = function(e){
      handler(ajax.response);
    };
  }
  catch(error){
    alert(error);
    console.log(error);
  }
  return exports;
};

main.keyPressed = function keyPressed(e){
    var theKey = 0;
    e =(window.event) ? event : e;
    theKey=(e.keyCode)? e.keyCode : e.charCode;
    return theKey;
};

main.showProps = function showProps(object, target){
  /*
      1. target and object are already objects, otherwise getElementById
      2. target is optional: write to it later only if is defined
      
      1. make array of properties (strings)
      2. sort the array 
      3. use its map method to create another array whose elements are:
          "num.) property is a: type" (type = typeof object[property])  
      4. display to console and to target (if it is specified and it exists).
  */
  object = document.getElementById(object) || object;
  target = document.getElementById(target) || target;
  var typeOfProps = [];
  var numberedProps = [];
  if(typeof object == 'object'){
      for (var prop in object){
          typeOfProps.push(prop);
      }
      typeOfProps.sort();
      numberedProps = typeOfProps.map(function(p,i){
          return (i+1) + ".) " + p + " is " + type(object[p]) +" (is typeof " + typeof object[p] +")";
      });
      var propsString = "";
      var id = (object.id)? object.id : "(name unknown)";
      console.log( numberedProps.length + " properties for " + "'"+ id +"'");
      numberedProps.forEach(function(m,i){
          console.log(m);
          buildPropsString(m, i, numberedProps.length);
      });
      if(target){target.innerHTML += propsString;}
  }
  else{
    throw new Error("Unknown object of type: " + typeof object);
  }
  //----helper--
  function buildPropsString(m, i, size){
    var id = (object.id)? object.id : "(name unknown)";
    if(i === 0){propsString += ( "<br/>" + size +" properties for " + "'" + id + "'<br/>");}
    propsString += ( m + "<br/>");       
  } 
  //----------------
  return exports;  
};//===END of showProps=====

main.log = function log(){
    var args = [].map.call(arguments, function(argument){
		return argument;
	});
	try{
		console.log.apply(console,args);		
	}
	catch(error){
		console.log(error.toString());
        return false;
	}
    return true;
}
//-------------------------------
main.createList =  function createList(){
    //-----head and tail pointers---------
    var firstListObject = null;
    var lastListObject = null;
    var listLength = 0;

    //-----helper------------
    function createListObject(newData){
        return {data: newData, next: null};
    }
    //---------------------
    var listObject = {
        //---methods---
        addData: function addData(newData){
           var newListObject = createListObject(newData);
           if(firstListObject === null){
            firstListObject = newListObject;
           }
           if(lastListObject !== null){
            lastListObject.next = newListObject;
           }
           lastListObject = newListObject;
           listLength++;
        },
        //------------------------------------------
        addToTop: function addToTop(newData){
           var newListObject = createListObject(newData);
           if(lastListObject === null){
            lastListObject = newListObject;
           }
           newListObject.next = firstListObject;
           firstListObject = newListObject;
           listLength++;
        },
        //-------------------------------------------
        showData: function showData(){
            var obj = firstListObject;
            while(obj){
                console.log(obj.data);
                obj = obj.next;
            }
            console.log("");
        },
        //-------------------------------------------
        getHead: function getHeadData(){
            return firstListObject;
        },
        //-------------------------------------------
        getTail: function getTailData(){
            return lastListObject;
        },
        //-------------------------------------------
        length: function length(){
            return listLength;
        },
    };
    //---------------------
    return listObject;
}//--END of createList function
main.makeList = main.createList;

main.curry = function curry(f){
    var i = 0                   // count used to collect curried function's args
    ,   rightSize = f.length    // the number of originally expected args
    ,   argsArray = []          // holder of growing args collection
    ;
    return function curriedF(){ // collect args provided by curried function
        for ( i = 0; i < arguments.length ; i++ ){
            argsArray.push(arguments[i]);
        }
        if ( argsArray.length >= rightSize ){
            var fullArray = argsArray;      // Save 'em before you...
            argsArray = [];                 // kill 'em (to start over again)
            return f.apply(null,fullArray); // return the originally intended result
        }
        else{
            return curriedF;                // Not enough arguments, so return to get 'em
        }
    };
}//==END of curry()==



main.type = type; //type is a private function being made a public method.

//===| End of exposed methods and data |===

//===| private helper functions |===
function setElementOrArray(s){
    /*
    Below is an "if-else-if" ladder to analyze the
    string for type: object, id, class, or tagname
    */

    //object already?
    if(typeof (s) === 'object' && type(s) !== 'array'){
        elem = s;
        //the type() function (defined below) returns the true type
        //by calling Object.prototype's toString() method on s
    }
    //id selector?
    else if(type(s) === 'string' && s.charAt(0) === '#' && s.length > 1){
        var id = s.slice(1);
        elem = document.getElementById(id);
    }
    //class selector?
    else if(type(s) === 'string' && s.charAt(0)=== '.' && s.length > 1){
        elem = null;
        array = getClassMembers(s);//assumes s has a leading "."
        fillToggleArray();
    }
    //element selector? (by tag name)
    else if(type(s) === 'string' && s.length > 0){
        elem = null;
        var elements = document.getElementsByTagName(s);
        for(var j = 0; j< elements.length; j++){
            array.push(elements[j]);
        }
        fillToggleArray();
    }
}
//----function to pre-fill the arrayToggleOn array
//with true for each array object
function fillToggleArray(){
    array.forEach(function(m){
        arrayToggleOn.push(true);
    });
}
//------------------------
function getClassMembers(className){
    //return an array of named class members if there are any,
    //or return undefined if not. Assumes className is a string that starts
    // with "."(the same as a css class selector)
    if(className.charAt(0) === "."){
        /*
        1. Save our class name.
        2. Make an array of all elements, and ...
        3. collect an array of only those elements that match the class name.
        4. Return the array (even if empty).
       */

        //1. save our classname
    	className = className.slice(1);

    	//2. make an array of all elements
    	var allElements = document.getElementsByTagName("*");
    	var classMembers = [];

    	// 3. collect those elements that match the class name
    	for(var i = 0;  i<allElements.length; i++){
        	if(allElements[i].className === className){
        		classMembers.push(allElements[i]);
        	}
    	}//--END of for(;;) gathering class members
    	return classMembers;
	}//---END of if-a-class
    else return;
}//---END of getClassMembers---
//------------------------
function type(aValue){
  //Sometimes better than typeof because
  //it returns a string describing x's true type.
  //If x is an array, "array" is returned
  //(whereas typeof array would return "object")

  var realType = {}.toString.call(aValue);//same as Object.prototype.toString.call(x);
  var prefix = "[Object ";
  realType = realType.slice(prefix.length, realType.length-1);
  realType = realType.trim().toLowerCase();

  return realType;
}
//===| end of private helper functions |===

return exports;
