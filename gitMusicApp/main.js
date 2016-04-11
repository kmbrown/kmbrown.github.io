/**
<div id="mobileHolder">
    <div id="content">
        <div>
            <span id="menuButton">&equiv;</span>
            <div id="currentlyPlaying"></div>
        </div>
        <h3 id="appTitle">Git Y'r Music!</h3>
           &nbsp;GitHub Friend&rAarr;<input id="gitname" type="text" class="roundPink">
            <input type="button" id="btn" value="Get Friend's Playlist" class="roundPink">
            <br/><br/>
          &nbsp;Current Playlist&rAarr;
        <select id="chooser" class="roundPink"><div id="shuffleIcon">testing</div>
            <option>Select A Playist</option>
        </select>
        <br/>
        <div id="playlistHolder">
            <select id="playlist" class="roundPink">
                <option>Choose a Song</option>
            </select>
        </div><!-- end of playlistHolder -->
        <br/>
        <audio id="audioPlayer" controls autoplay src="http://www.noiseaddicts.com/samples_1w72b820/4929.mp3"></audio>
        <!--http://www.noiseaddicts.com/free-samples-mp3/-->
    </div><!-- end of content -->
</div><!-- end mobileHolder-->
*/
"use strict";

//====| Global Objects and Data |====

function id(string) {
    return document.getElementById(string);
}
var content = id("content");
var gitname = id("gitname");
var btn = id("btn");
var chooser = id("chooser");
var playlist = id("playlist");
var audioPlayer = id("audioPlayer");
var currentlyPlaying = id("currentlyPlaying");
var menuButton = id("menuButton");
var menu = id("menu");
var X = id("X");
var propNames = Object.keys;
var playlistHeader = "Choose a Song";
var ajax = new XMLHttpRequest();
var lists = {};
var namesArray = [];
var songsArray = [];
var currentUrl = "";
var currentPlayListName = "";
var busyFlashingColor = false;
var busyFlashingStyle = false;
var menuOpen = false;

//====| The Driver's Seat |====

window.onload = initialize;
playlist.onchange = playSong;
btn.onclick = function (e) {
    flashObjectColor(this, "white", 0.25);
    getNewList(e);
};
menuButton.onclick = function (e) {
    toggleMenu(e);
    flashObjectColor(this, "white", 0.25);
};
X.onclick = function (e) {
    toggleMenu(e);
    flashObjectColor(this, "white", 0.25);
};
id("appTitle").onclick = function (e) {
    toggleMenu(e);
    flashObjectColor(menuButton, "white", 0.25);
};
gitname.onkeyup = getNewList;
gitname.onclick = function () {
    this.value = "";
};
chooser.onchange = changePlayList;

//====| Under The Hood |====

function initialize() {
    // 1. Augment our lists object with downloaded lists
    addListsFromServer();
    // 2. Fill our chooser with lists' names
    //addPlaylistNamesToBox();//called from within 1. above
    // 3. Further augment our lists object with browser's copy
    addListsFromBrowser();
    // 4. Store lists object on the browser
    storeListsToBrowser();
    configureResizing();
    
} //===| END of initialize() |=====

var addListsFromBrowser = function addListsFromBrowser() {};
//----------
var addListsFromServer = function addListsFromServer() {
    var listGetter = new XMLHttpRequest();
    listGetter.open("GET", "lists.json");
    listGetter.send();
    //-----
    listGetter.onload = function () {
        if (listGetter.status === 200) {
            var userLists = JSON.parse(listGetter.response);
            for (var list in userLists) {
                if (!lists[list]) {
                    lists[list] = userLists[list];
                }
            }
        }
        addPlaylistNamesToBox(); //the slippery slope to callback hell
    };
};
var storeListsToBrowser = function storeListsToBrowser() {};
//----------
function configureResizing() {
    resizeAndCenter();
    window.onresize = resizeAndCenter;
    //----helpers-----
    function resizeRootEm() {
        document.documentElement.style.fontSize = 1.2 * window.innerWidth / 100 + 10 + "px";
    }
    function centerPlayer() {
        var dimensions = id("content").getBoundingClientRect();
        var top = 1 / 2 * (window.innerHeight - dimensions.height).toFixed(2) + "px";
        var left = 1 / 2 * (window.innerWidth - dimensions.width).toFixed(2) + "px";
        content.style.top = top;
        content.style.left = left;
        menu.style.top = top;
        menu.style.left = left;
    }
    function resizeAndCenter() {
        resizeRootEm();
        centerPlayer();
    }
    //-------------
}
//----------
var addPlaylistNamesToBox = function addPlaylistNamesToBox() {
    for (var userName in lists) {
        addNameToBox(userName);
        /**
            Let the addNameToBox() function
            sort out duplicates
        */
    }
};
//----------
function getNewList(e) {
    var enterKey = 13;
    if (e.keyCode && e.keyCode !== enterKey) {
        return;
    }

    //point to url
    var url = "https://" + gitname.value + ".github.io/music/list.json";
    ajax.open("GET", url);
    ajax.send();
    //------------
    ajax.onload = function () {
        if (ajax.status === 200) {
            saveNewList();
        } else {
            alert("Trouble getting list:\n" + ajax.response);
        }
    };
}
//----------
function saveNewList() {
    var newname = gitname.value.toLowerCase().trim();
    if (!lists[newname]) {
        //save new list to our lists object
        var newListObject = JSON.parse(ajax.response);
        var sortedListObject = sortedListByArtist(newListObject);
        newListObject = sortedListObject;
        lists[newname] = newListObject;
        addNameToBox(newname);
        sendListToServer(lists);
    }
    storeListsToBrowser(lists);
}
//----------
function addNameToBox(newGitName) {
    //make a real array of options from chooser
    var opsArray = [].slice.call(chooser.options, 0);
    namesArray = [];
    opsArray.forEach(function (m) {
        namesArray.push(m.innerHTML);
    });
    //add newGitName only if not aready there
    if (namesArray.indexOf(newGitName) === -1) {
        var op = document.createElement("option");
        op.innerHTML = newGitName;
        chooser.appendChild(op);
        gitname.value = "";
        gitname.placeholder = newGitName + " playlist saved";
    }
}
//----------
function changePlayList(e) {
    if (chooser.selectedIndex === 0) {
        playlist.innerHTML = "";
        var topOption = document.createElement("option");
        topOption.innerHTML = playlistHeader;
        playlist.appendChild(topOption);
        playlist.selectedIndex = 0;
        return;
    }
    var list = chooser.options[chooser.selectedIndex].innerHTML;
    currentPlayListName = list;
    currentUrl = "https://" + list + ".github.io" + "/music/";
    songsArray = propNames(lists[list]);

    playlist.innerHTML = "";
    var header = document.createElement("option");
    header.innerHTML = playlistHeader;
    playlist.appendChild(header);
    songsArray.forEach(function (m) {
        var artistTitle = lists[list][m].artist + " - " + lists[list][m].title;
        var option = document.createElement("option");
        option.innerHTML = artistTitle;
        playlist.appendChild(option);
    });
    flashObjectColor(playlist, "white", 0.3);
    flashObjectStyle(playlist, "textShadow", "1px 1px 1px black", 0.4);
}
//----------
function playSong() {
    var i = playlist.selectedIndex;
    if (i > 0) {
        currentlyPlaying.innerHTML = playlist[i].innerHTML + " (" + currentPlayListName + ")";
    }
    i -= 1;
    if (i >= 0) {
        var url = currentUrl + songsArray[i] + ".mp3";
        audioPlayer.src = url;
    }
}
//----------
function sendListToServer(listObject) {
    var listString = JSON.stringify(listObject);
    var listSender = new XMLHttpRequest();
    var form = new FormData();
    listSender.open("POST", "phpfiles/getPlaylists.php");
    form.append("lists", listString);
    listSender.send(form);
    //----------------------
    listSender.onload = function () {
        if (listSender.status !== 200) {
            alert(listSender.response);
        }
    };
}
//-------
function flashObjectColor(object, color, durationSeconds) {
    if (busyFlashingColor) return;
    busyFlashingColor = true;
    var oldColor = object.style.color;
    object.style.color = color;
    setTimeout(function () {
        object.style.color = oldColor;
        busyFlashingColor = false;
    }, 1000 * durationSeconds);
}
//-----
function flashObjectStyle(object, style, value, durationSeconds) {
    if (busyFlashingStyle) return;
    busyFlashingStyle = true;
    var oldStyle = object.style[style];
    object.style[style] = value;
    setTimeout(function () {
        object.style[style] = oldStyle;
        busyFlashingStyle = false;
    }, 1000 * durationSeconds);
}
//---------
function sortProperties(object){
	var sortedObject = {};
	var propNames = Object.keys(object);
	propNames.sort();
	for (var i=0; i < propNames.length; i++ ){
		sortedObject[propNames[i]] = object[propNames[i]];
	}
	return sortedObject;
}
//---------
function sortedListByArtist(object){
    var artist, title, joiner = "```";//tripple backtick unlikely to conflict 
	//first gather the song filenames (keys of the list object)
	var recordNames = Object.keys(object);
	//prepare for a list of primary keys: artist```title
	var primaryKeys = [];
	//combine the artist and title of each song
	recordNames.forEach(function(m){
		artist = object[m].artist;
		title = object[m].title;
		var primaryKey = artist + joiner + title;
		primaryKeys.push(primaryKey);
	});
	//of course sort the primary keys. This is the central action
	primaryKeys.sort();

	//prepare for a sorted collection of song filenames (keys of the list object)
	var sortedObject = {};
	for(var i=0; i < primaryKeys.length; i++){
		artist = primaryKeys[i].split(joiner)[0];
		title = primaryKeys[i].split(joiner)[1];
		/*
			1.) Iterate through each member of the original object & look for this artist.
			2.) Match this artist to this title in the orignal object.
			3.) Save the original song to the new object song list.
			4.) Return the completed sorted object.
		*/
		//1.) Iterate through each, etc. ...
		for(var aSong in object){
			if(object[aSong].artist === artist){
				//2.) Match this artist to this title, etc. ...
				if(object[aSong].title === title){
				    //3.) Save the origianl song, etc..
					sortedObject[aSong] = object[aSong];
				}
			}
		}	
	}
	//4.) return the sorted object.
	return sortedObject;
}//===| end of sortedListByArtist() |=====

function toggleMenu(){
    if(menuOpen){
        menu.style.visibility = "hidden";
        menu.style.opacity = 0;
        menuOpen = false;
    }
    else{
        menu.style.visibility = "visible";
        menu.style.opacity = 1;
        menuOpen = true;
    }
}