<?php

$root = $_SERVER['DOCUMENT_ROOT'] . "/";
$filename = "gitmusicapp/lists.json";
$destination = $root . $filename;
$source = $_POST['lists'];

file_put_contents($destination, $source);

exit("Check for saved file.");

?>