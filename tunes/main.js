/**
<div id="content">
    GitHub Name: <input id="gitname">
    <button id="btn">Get Playlist</button>
    <br/><br/>
    Current Playlist: <select id="chooser">
        <option>Select A Playist</option>
    </select>
    <br/>
    <div id="playlistHolder">
        <select id="playlist">
            <option>Choose Song</option>
        </select>
    </div>
</div>
*/
//---data--
function id(string){return document.getElementById(string);}
var propNames = Object.keys;
var gitname =id("gitname");
var btn = id("btn");
var chooser = id("chooser");
var playlistHolder = id("playlistHolder");
var playlist = id("playlist");

var ajax = new XMLHttpRequest();
var lists = {};
var namesArray = [];
var songsArray = [];
var currentPlayListName = "";
var currentUrl = "";

//---event handlers----
//temporary test of songs:
playlist.onchange = playSong;

window.onload = initialize;
btn.onclick = getNewList;
chooser.onchange = changePlayList;
gitname.onkeyup = function(e){
    if(e.keyCode === 13){
        getNewList();
    }
};
gitname.onclick = function(){this.value="";};

//-----functions-------
function initialize(){
    // 1. Augment our lists object with downloaded lists
    addListsFromServer();
    // 2. Fill our chooser with lists' names
    //addPlaylistNamesToBox();//called from within 1. above    
    // 3. Further augment our lists object with browser's copy
    addListsFromBrowser();
    // 4. Store lists object on the browser
    storeListsToBrowser();
    
}//===| END of initialize() |=====

var addListsFromBrowser = ()=>{};
var addListsFromServer = ()=>{
    var listGetter = new XMLHttpRequest();
    listGetter.open("GET","lists.json");
    listGetter.send();
    //-----
    listGetter.onload = ()=>{
        if(listGetter.status === 200){
            var userLists = JSON.parse(listGetter.response);
            for (var list in userLists){
                if(!lists[list]){
                    lists[list] = userLists[list];
                }
            }
        }
        addPlaylistNamesToBox();//the slippery slope to callback hell
    };
};
var storeListsToBrowser = ()=>{};
var addPlaylistNamesToBox = ()=>{
    for(var userName in lists){
        addNameToBox(userName);
        /**
            Let the addNameToBox() function
            sort out duplicates
        */
    }
};

function getNewList(){
    //point to url
    var url = "https://" + gitname.value + ".github.io/music/list.json";
    ajax.open("GET", url);
    ajax.send();
    //------------
    ajax.onload = function(){
        if(ajax.status === 200){
            saveNewList();
        }
        else{
            alert("Trouble getting list:\n" + ajax.response);
        }
    };
}    

function saveNewList(){
    var newname = gitname.value.toLowerCase().trim();
    if(!lists[newname]){
        //save new list to our lists object
        lists[newname] = JSON.parse(ajax.response);
        addNameToBox(newname);
        sendListToServer(lists);

    }
    storeListsToBrowser(lists);
}

function addNameToBox(newGitName){
    //make a real array of options from chooser
    var opsArray = [].slice.call(chooser.options, 0);
    namesArray = [];
    opsArray.forEach(function(m){
        namesArray.push(m.innerHTML);

    });
    //add newGitName only if not aready there
    if(namesArray.indexOf(newGitName) === -1){
        var op = document.createElement("option");
        op.innerHTML = newGitName;
        chooser.appendChild(op);
        gitname.value = "";
        gitname.placeholder = newGitName;
    }
}

function changePlayList(e){

    var list = chooser.options[chooser.selectedIndex].innerHTML;
    currentUrl = "https://" + list + ".github.io"+ "/music/";
    currentPlayListName = list;
    songsArray = propNames(lists[list]);
    
    playlist.innerHTML = "";
    var header = document.createElement("option");
    header.innerHTML = "Choose a Song";
    playlist.appendChild(header);
    songsArray.forEach(function(m){
        var artistTitle =lists[list][m].artist + " - " +  lists[list][m].title;
        var option = document.createElement("option");
        option.innerHTML = artistTitle;
        playlist.appendChild(option);
    });
}

function sendListToServer(object){
    var objectString = JSON.stringify(object);
}

function playSong(){
    var i = playlist.selectedIndex;
    i-=1;
    if(i >= 0){
        var url = currentUrl+songsArray[i]+".mp3";
        window.open(url);   //document.location.assign(url)        
    }

}
