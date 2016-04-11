//==================================
/*
    Author: Abbas Abdulmalik
    Creation Date: October 3, 2015
    Revised: March 8, 2016
    Purpose: Attempt to make a "require-like" synchronous module loader
             using presumably a CommonJS format for the modules.
             
             Latest revision: This version is renamed rekwire.js and rekwire
             to avoid a conflict with Babel's in-browser compiler browser.js
    
    Notes:  
            1.) This is an IIFE in order to privatize the CACHE as a closure variable.
            2.) properly formatted modules must attach their properties to
                the object named 'exports' (which is defined by this require function).
            3.) require's 2nd argument, 'getAgain', is an optional boolean
                that must be true to load the module bypassing CACHE: the module will reload
                from the drive or from the network.
            4.) require's mandatory first argument can be in one of two formats:
                a.) Local File format: require('myLocalModule' [, boolean getAgain]), where myLocalModule 
                    will be loaded as 'modules/myLocalModule.js', a js file located in
                    the local directory named 'modules'. The directory name and the .js extension must be omitted
                    (until I fix this to allow them)
                b.) Remote File format:
                    require("https://remoteServer/fullpath/myRemoteModule.js" [, boolean   getAgain]).
                    This is the full url path to a remote module.
           *5.) Now there is another type of module to accommodate jQuery-like functions (like the '$'),
                which can be used either as an object with methods, or as function itself. This type of module
                expects the argument 'imports' not 'exports'. The module will then be exported
                as a function, not as an object.
                The module can look something like this:
                //=========================================
                function func(string){
                    //code to process the input string
                    // ...
                    //-----attach other functions to func: -----
                    func.f1 = function f1(args){
                        //code to process args
                        return func; //return func for chaining
                    };
                    //---------------------------
                    func.f2 = function f2(args){
                        //code to process args
                        return func; //return func for chaining
                    };
                    //---------------------------   
                    func.fEtc = function fEtc(args){
                        //code to process args
                        return func; //return func for chaining
                    };
                    //---------------------------
                    imports = func; //assign func to the imports expected by require.
                    return imports; //imports will become the exports, unchanged.
                }
                //===================================================
                
*/
//================================
(function(){
  var CACHE = {};
   /*
  * Make rekwire() a closure, exposed globally by attaching it to 'this'.
  * The rekwire() function will then be able to access the CACHE privately.
  */
  this.rekwire = function rekwire(apiFilename, getAgain){
      /*
        Check to see if apiFilename is CACHE-ed.
        If so, return the CACHED version
        without downloading it again from the server
        unless getAgain = true.
      */      
      if(!!CACHE[apiFilename] && !getAgain){
        //alert("RE-USING ...\n" + apiFilename);
        return CACHE[apiFilename];
      }
      //--------------------------------------
      var chain = {
          start: function start(slowFunc){
              //making the queue
              var queue = {                
                      stack: [],
                      response: null,
                      flushing: false,
                      then: function then(f){
                          if(this.flushing){
                              f(this.response);
                          }
                          else{
                              this.stack.push(f);
                          }
                          return this;
                      },
                      flush: function flush(r){
                          if(this.flushing){return;}
                          this.response = r;
                          this.flushing = true;
                          while(this.stack[0]){
                              this.stack.shift()(this.response);                       
                          }
                      },
                      start: this.start
              };
              
              //using the queue: slowFunc should flush q at the end
              if(arguments[0])slowFunc(queue);
              
              //returning the queue
              return queue;
          }
      };    
      //------------------------------------------
      var exports = {};
      chain //Is chain object not needed for synch operations?
          .start(getApiString)
          .then(wrapApiInExports)
          .then(cacheIt)
      ;
      return exports;
      //------helpers------
      function cacheIt(){
        if(!CACHE[apiFilename]){CACHE[apiFilename] = exports;}
      }      
      function getApiString(q){
          var path = "";
          if(apiFilename.toLowerCase().search('http') === 0){
              //filename is a web address
              path = apiFilename;
              if(typeof getAgain !== 'undefined' && typeof getAgain === 'boolean' ){
                  if(getAgain === true ){
                      path = apiFilename + "?" + Date.now();//unique number clears browser cache for reloading                   
                  }
              }
          }else{
              //file from our site in modules folder
              //path = `modules/${apiFilename}.js`;
              path = 'modules/' + apiFilename + '.js' ;
          }
          var ajax = new XMLHttpRequest();          
          /* Quoting Eric Elliot:
          "The CommonJS module system has a much simpler syntax than either
          the module pattern or AMD. In CommonJS, the file is the module. There
          is no need for a function wrapper to contain the scope, because each
          file is given its own scope. Modules declare dependencies with
          a synchronous require() function. That means that execution is blocked
          while the required module is being resolved, so it's safe to start using
          the module immediately after you require it."
          */
          // !important: CommonJS requires synch not asynch: must use "false"
          try{
              ajax.open("GET", path, false); 
              ajax.send();              
          }catch(doNothing){
              //trying to keep browser from complaining
          }

          if(ajax.status === 200 || ajax.status === 0){
              q.flush(ajax.response);            
          }else{
               alert("Trouble getting 'required' file:\n"+
                path + "\n" + "Status code: " +
                ajax.status
                );
              q.flush(undefined);
          }
      }
      //-------------------
      function wrapApiInExports(r){
          //--try to see if the function is its own exports;
          try{
              var f2 = new Function("imports", r);
              var imports = null;              
              exports = f2(imports);
              //if no errors, exports was undefined within the function
              //...so, the function was its own exports
              return;
          }catch(doNothing){
              //reference to exports are caught
          }
          //--conventional exports to be mutated below  
          var f = new Function("exports", r);
          f(exports);
      }
      //------------------
   }//--END of require function
   this.rekwire.getValue = function getValue(key){
     return CACHE[key];
   };
})();
//===========================






