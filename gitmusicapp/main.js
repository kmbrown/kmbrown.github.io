/**

    Author: Abbas Abdulmalik
    Creation Date: April 7, 2016
    Title:  Git Y'r Music
    Revised: April 12, 2016
    Purpose: A music playlist sharing app
    Notes: play friends' music without downloading the file

<div id="mobileHolder">
    <div id="content">
        <div>
            <span id="menuButton">&equiv;</span>
            <div id="currentlyPlaying"></div>
        </div>
        <h3 id="appTitle">Git Y'r Music!</h3>
           &nbsp;GitHub Friend&rAarr;<input id="gitName" type="text" class="roundPink">
            <input type="button" id="friendButton" value="Get Friend's Playlist" class="roundPink">
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
/*global CreateListMixer*/
var getRandomSong = CreateListMixer();
var nextSong = id("nextSong");
var content = id("content");
var gitName = id("gitName");
var friendButton = id("friendButton");
var chooser = id("chooser");
var playlist = id("playlist");
var audioPlayer = id("audioPlayer");
var currentlyPlaying = id("currentlyPlaying");
var menuButton = id("menuButton");
var menu = id("menu");
var X = id("X");
var appTitle = id("appTitle");
var colorSlider = id("colorSlider");
var shadowSlider = id("shadowSlider");
var gitColor = id("gitColor");
var fileInput = id("fileInput");

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
var prefix = ["-webkit-","-moz-","-ms-","-o-",""];
var mainColorAngle = 186;
var backgroundColorAngle = 6;
var shuffleBox = id("shuffleBox");
var shuffleState = id("shuffleState");
var shuffleIcon = id("shuffleIcon");
var shuffleOn = false;
var shuffleTimerId = null;

//====| The Driver's Seat |====

window.onload = initialize;
chooser.onchange = changePlayList;
playlist.onchange = playSong;
friendButton.onclick = getNewList;
menuButton.onclick = toggleAndFlash;
X.onclick = toggleAndFlash;
appTitle.onclick = toggleAndFlash;
shuffleBox.onclick = toggleShuffle;
audioPlayer.onended = playNextSong;
nextSong.onclick = playNextSong;

//---| menu actions |------

gitName.onkeyup = getNewList;
gitName.onclick =clearInput;
fileInput.onchange = uploadSong;
colorSlider.oninput = showColors;
colorSlider.onmousedown = showColors;
gitColor.onmouseup = hideColors;

//---| END menu actions |------

//------| testing out stuff |--------
shadowSlider.onblur = function(e){
    shadowSlider.style.visibility = "hidden";
};
shadowSlider.onclick = function(e){
    shadowSlider.style.visibility = "hidden";
};
menu.onclick = function(e){
    shadowSlider.style.visibility = "hidden";
};

//====| Under The Hood |====

function playNextSong(e){
    if(shuffleOn && chooser.selectedIndex !== 0){
        playlist.selectedIndex = songsArray.indexOf(getRandomSong()) + 1;
        playSong();
    }     
}

function uploadSong(){
    try{
        var file = this.files[0];
        var noMp3 = file.name.substring(0, file.name.length - 4);
        var artist = noMp3.split("-")[0].trim();
        var title = noMp3.split("-")[1].trim();
        /**
         * 0.) Limit file to .mp3 files.
         * 1.) Pop a dialog and get title and artist.
         * 2.) Validate file, artist and title (no blank fields)
         * 3.) Ajax post to getMusicFile.php setting requestHeaders
         *
        */
        //---| ajax post |---
        var fileSender = new XMLHttpRequest();
        fileSender.open("POST","phpfiles/getMusicFile.php");
        fileSender.setRequestHeader("title", title);
        fileSender.setRequestHeader("artist", artist);
        fileSender.setRequestHeader("filename", file.name);
        fileSender.send(file);

        //---| post's response |---
        fileSender.onreadystatechange = function(){
            if(fileSender.readyState === 4){
                alert("Status: "+
                    fileSender.status +
                    "\n" +
                    fileSender.responseText
                );
            }
        };
    }
    catch(error){
        alert("Problems uploading a song.\n" + error);
    }
}

function initialize() {
    // 1. Augment our lists object with downloaded lists
    addListsFromServer();
    // 2. Fill our chooser with lists' names
    //addPlaylistNamesToBox();//called from within 1. above
    // 3. Further augment our lists object with browser's copy
    addListsFromBrowser();
    // 4. Store lists object on the browser
    //storeListsToBrowser();
    configureResizing();
    loadColorsFromBrowser();

} //===| END of initialize() |=====

function toggleShuffle(){
    if(shuffleOn){
        turnShuffleOff();
    }
    else{
        turnShuffleOn();
    }
}
toggleShuffle.angle = 0;

function turnShuffleOn(){
    if(chooser.selectedIndex === 0){return;}
    playlist.selectedIndex = songsArray.indexOf(getRandomSong(songsArray)) + 1;
    playSong();
    shuffleBox.style.boxShadow = "inset 1px 1px 1px black";
    shuffleState.innerHTML = "on";
    shuffleState.style.color = "lightgray";
    shuffleIcon.style.color = "lightgray";
    shuffleState.style.textShadow = "0 1px 0 black";
    shuffleIcon.style.textShadow = "0 1px 0 black";
    shuffleOn = true;
    toggleShuffle.angle = -10;
    shuffleTimerId = setInterval(function(){
        toggleShuffle.angle += 10;
        shuffleIcon.style.transform = "rotateZ(" + toggleShuffle.angle % 360 + "deg)";
    },100);    
}
function turnShuffleOff(){
    shuffleBox.style.boxShadow = "1px 1px 1px black";
    shuffleState.innerHTML = "off";
    shuffleState.style.textShadow = "0 1px 0 hsl(165,50%,70%)";
    shuffleIcon.style.textShadow = "0 1px 0 hsl(165,50%,70%)";
    shuffleState.style.color = "black";
    shuffleIcon.style.color = "black";
    clearInterval(shuffleTimerId);
    shuffleIcon.style.transform = "rotateZ(90deg)";
    shuffleOn = false;    
}
function loadColorsFromBrowser(){
    if(window.localStorage){
        var possibleAngle = window.localStorage.getItem("mainColorAngle");
        if(possibleAngle){
            mainColorAngle = possibleAngle;
            colorSlider.value = mainColorAngle;
            setMainColor();
        }
        else{
            setMainColor();
        }
        possibleAngle = window.localStorage.getItem("backgroundColorAngle");
        if(possibleAngle){
            backgroundColorAngle = possibleAngle;
            setBackgroundColor();
        }
        else{
           setBackgroundColor();
        }
    }
}

function toggleAndFlash(e){
    e.stopPropagation();
    toggleMenu(e);
    flashObjectColor(menuButton, "white", 0.25);
}

function clearInput(e){
    e.target.value = "";
}

function showColors(e){
    e.stopPropagation();
    setMainColor();
    setBackgroundColor();
    menu.style.transition = "all 0s ease";
    menu.style.visibility = "hidden";
    shadowSlider.style.visibility = "visible";
    shadowSlider.value = colorSlider.value;
    menuOpen = false;
}

function hideColors(){
    menu.style.transition = "all 1s ease;";
    shadowSlider.style.visibility = "hidden";
}

function setMainColor(){
    mainColorAngle = colorSlider.value;
    prefix.forEach(function(pre){
        content.style.background = pre +
        "linear-gradient(-60deg, hsl(" +
            mainColorAngle +
            ", 50%, 40%), white)"
        ;
    });
    if(window.localStorage){
        window.localStorage.setItem("mainColorAngle",mainColorAngle);
    }

}
function setBackgroundColor(){
    backgroundColorAngle = (mainColorAngle - 180);

    prefix.forEach(function(m){
        document.body.style.background = m +
            "linear-gradient(60deg, white, hsl(" +
            backgroundColorAngle +
            ", 50%, 50%)) no-repeat"
        ;
        document.body.style.backgroundSize = "cover";
        appTitle.style.background = m +
            "linear-gradient(60deg, white, hsl("+
            backgroundColorAngle +
            ", 50%, 50%)) no-repeat"
        ;
    });



    if(window.localStorage){
        window.localStorage.setItem("backgroundColorAngle",backgroundColorAngle);
    }
}

function addListsFromBrowser(){
    if(window.localStorage){
        if(window.localStorage.getItem("lists")){
            var serverList = window.localStorage.getItem("lists");
            var userLists = JSON.parse(serverList);
            for (var list in userLists) {
                if (!lists[list]) {
                    lists[list] = userLists[list];
                }
            }
        }
    }
}
//----------
function addListsFromServer() {
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
        storeListsToBrowser();
    };
}

function storeListsToBrowser() {
    if(window.localStorage !== undefined){
        var listString = JSON.stringify(lists);
        window.localStorage.setItem("lists", listString);
    }
}
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
    function alignSliders(){
        var sliderStats = colorSlider.getBoundingClientRect();
        shadowSlider.style.position = "absolute";
        shadowSlider.style.left = sliderStats.left + "px";
        shadowSlider.style.top = sliderStats.top  + "px";
        shadowSlider.value = colorSlider.value;

    }
    //-------------------
    function resizeAndCenter() {
        resizeRootEm();
        centerPlayer();
        alignSliders();
    }
    //-------------

}
//----------
function addPlaylistNamesToBox() {
    for (var userName in lists) {
        addNameToBox(userName);
        /**
            Let the addNameToBox() function
            sort out duplicates
        */
    }
}
//----------
function getNewList(e) {
    var enterKey = 13;
    if (e.keyCode && e.keyCode !== enterKey) {
        return;
    }

    //point to url
    var url = "https://" + gitName.value + ".github.io/music/list.json";
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
    var newname = gitName.value.toLowerCase().trim();
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
        gitName.value = "";
        gitName.placeholder = newGitName + " playlist saved";
    }
}
//----------
function changePlayList(e) {
    turnShuffleOff();
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
        menu.style.transition = "all 1s ease";
        menu.style.visibility = "hidden";
        menu.style.opacity = 0;
        menuOpen = false;
    }
    else{
        menu.style.transition = "all 1s ease";
        menu.style.visibility = "visible";
        menu.style.opacity = 1;
        menuOpen = true;
    }
}