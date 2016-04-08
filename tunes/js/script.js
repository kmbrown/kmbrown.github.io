var shuffleBtn = O("shuffleBtn");
var songSelection = O("songSelection");
var audioPlayer = O("audioPlayer");
//var playList = getPlaylist();
var currentPool = [];
var filename = "";
var randomIndex = 0;
var shuffling = false;
var delay = 0.25;
/*global O*/
/*global S*/
/*global C*/

//////////////////////// intialize and resize on load, etc.  ///////////////////
window.onload = init;
window.onresize = resize;
//////////////////////////  resize, etc //////////////
function resize(){
    S(document.documentElement).fontSize = (window.innerWidth/100) + "px";
    centerThePlayer();    
}
function init(){
    resize();
}
////////////// Start in ""un-shuffle"" mode //////////////////////
(function(){
    var shuffleMessage = "Shuffle Songs";
    var stopShuffleMessage = "STOP Shuffle";
    shuffleBtn.innerHTML = shuffleMessage;
    shuffleBtn.onclick = function(){
        if(shuffling){
            shuffling = false;
            S("nextSong").display="none";
            shuffleBtn.innerHTML = shuffleMessage;
            playSongsRandomly(shuffling);
        }
        else if(!shuffling){
            shuffling = true;
            S("nextSong").display="inline-block";
            shuffleBtn.innerHTML = stopShuffleMessage;
            playSongsRandomly(shuffling);
        }
    };
})();
///////////////////////////////////////////////
function playSongsRandomly(shuffling){
    if(!shuffling){
        //stop player (pause, actually)
        audioPlayer.pause();
    }
    else{
        //clear drop down selection
        songSelection.selectedIndex = 0;

        //fill empty song pool
        if( currentPool.length === 0){
            currentPool = getPlaylist();
        }

        //choose a song that wasn't just played
        do{
            randomIndex = Math.floor((currentPool.length)*Math.random());
        }while(currentPool[randomIndex] === filename && currentPool.length > 1 );
        filename = removeArrayMember(currentPool, randomIndex);
        chooseMp3OrOgg(filename);
        delayPlay(delay);
        showWhatsPlaying();
    }
}
///////////////////////////////////////////////
function getPlaylist(){
    var array = [];
    for(var i=1; i< songSelection.options.length; i++){
        array.push(songSelection.options[i].value);
    }
    return array;
}
//////////////////////////////////////////////
songSelection.onchange = function(){
    if(songSelection.selectedIndex !== 0){
        O("filePlaying").innerHTML="";
        filename = songSelection.options[songSelection.selectedIndex].value;
        chooseMp3OrOgg(filename);
        audioPlayer.volume = 0.75;
        delayPlay(delay);
        showWhatsPlaying();
    }
    else{
        audioPlayer.src = "";
        O("filePlaying").innerHTML = "Trouble with file or file type.";
    }
};
///////////////////////////////////////////////////////////////

//==========================
audioPlayer.onerror = function(){
    O("filePlaying").innerHTML = "Error: Trouble loading audio file.";
};
//==========================
audioPlayer.onended = function(){
    playSongsRandomly(shuffling);
};
O("nextSong").onclick = function(){
    shuffleBtn.click();
    shuffleBtn.click();
};
//////////////////////////////////////
function showWhatsPlaying(){
    for(var i = 0;  i< (songSelection.options).length; i++){
        if (filename === songSelection.options[i].value){
            O("filePlaying").innerHTML = songSelection.options[i].innerHTML;
        }
        songSelection.selectedIndex = 0;
    }
}
//============================================
function delayPlay(seconds){
    seconds = seconds || 0.25;
    setTimeout(function(){
        audioPlayer.load();
    },1000*seconds);
    setTimeout(function(){
        audioPlayer.pause();
    },1025*seconds);
    setTimeout(function(){
        audioPlayer.play();
    },1050*seconds);
}
//============================================
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
//pure side effect: audio source chosen for player
function chooseMp3OrOgg(file_name){
    if( supportsMp3() ){
        audioPlayer.src = "music/" + file_name + ".mp3";
    }
    else if( supportsOgg() ){
        audioPlayer.src =  "music/" + file_name + ".ogg";
    }
    else{
        audioPlayer.src = "";
        O("filePlaying").innerHTML = "Trouble with file or file type."
    }
}
////////////////////////////////////////////
//==========================
function supportsMp3(){
    var answer = audioPlayer.canPlayType('audio/mpeg;codecs="mp3"');
    if(answer == "" || answer =="no"){
        return false;
    }
    else{
        return true;
    }
}
function supportsOgg(){
    var answer = audioPlayer.canPlayType('audio/ogg;codecs="vorbis"');
    if(answer == "" || answer =="no"){
        return false;
    }
    else{
        return true;
    }
}

function centerThePlayer(){
    var rectangle = O("content").getBoundingClientRect();
    var height = rectangle.height;
    var width = rectangle.width;
    S("content").top = (1/2)*(window.innerHeight - height) + "px";
    S("content").left = (1/2)*(window.innerWidth - width) + "px";
    
}

//http://24ways.org/2010/the-state-of-html5-audio
//http://www.w3schools.com/tags/av_met_canplaytype.asp
//http://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_av_met_canplaytype
