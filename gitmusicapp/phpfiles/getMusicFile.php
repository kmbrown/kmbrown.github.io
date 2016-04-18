<?php

/*
To reduce server errors,
edit the php.ini file as follows:

    memory_limit = 256M
    upload_max_filesize = 50M
    post_max_size = 50M
    max_execution_time = 60

Then, reboot the server.
*/
$musicFilename = $_SERVER['HTTP_FILENAME'];
$artist = $_SERVER['HTTP_ARTIST'];
$title = $_SERVER['HTTP_TITLE'];

$webroot  = $_SERVER['DOCUMENT_ROOT'] . '/';
$musicFolder = $webroot . "music/";

//====| Save mp3 file to music folder |====

$destination = $musicFolder . $musicFilename;
$source = file_get_contents('php://input');

//if the file doesn't already exist
if( !file_exists($destination) ){
    
    //====| Backup current list.json file |====


    file_put_contents($destination, $source);

    //====| "Append" the music list file |====
    $noMp3 = substr($musicFilename, 0, $musicFilename.length - 4);
    $listAddition = ",
    \"$noMp3\" :{
        \"title\" : \"$title\",
        \"artist\" : \"$artist\"
    }
}";//closes of the main object literal
    
    $listAddition = trim($listAddition);
    $listPath = $musicFolder . "list.json";
    $list = trim(file_get_contents($listPath));
    $list = substr($list, 0, $list.length -1);
    $list = trim($list);

    $list = $list . $listAddition;
    $source = $list;
    $destination = $musicFolder . "list.json";
    file_put_contents($destination, $source);
    
    //====| exit program |=====
    //exit(  implode ("\n", scandir($musicFolder)   ) );
    exit("Push to github and check for file: " . $musicFilename);
}
else{
    //====| exit program |=====    
    exit("File '" . $musicFilename  . "' already exists");    
}

?>