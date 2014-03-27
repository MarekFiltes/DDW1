<?php
    define("FOLDER_PATH", "../documents/");
    define("FILE_EXTENSION",".xml");  
        
    if (isset($_POST['save']) && $_POST['save']){

        $fileName = $_POST['file'] . FILE_EXTENSION;
        $fileFullPath = FOLDER_PATH . $_POST['file'] . FILE_EXTENSION;     
        $file_URL = $_POST['url'];                     
        $file_CHARSET = "UTF-8";
        
        if($_POST['title'] != null){
            $file_TITLE = $_POST['title'];
            $att_TITLE = " title='". $file_TITLE ."'";
        }else{
            $att_TITLE = "";
        }
         
        if($_POST['keywords'] != null){
            $file_KEYWORDS = $_POST['keywords'];
            $element_KEYWORDS = "<keywords>".$file_KEYWORDS."</keywords>";
        }else{
             $element_KEYWORDS = "";
        }
        
        if($_POST['text'] != null){
            $file_TEXT = $_POST['text'];
            $element_TEXT = "<text>".$file_TEXT."</text>";
        }else{
             $element_TEXT = "";
        }       
        
        $XML_HEADER = "<?xml version='1.0' encoding='".$file_CHARSET."' ?>";
      
        $file_CONTENT = $XML_HEADER ."<site url='".$file_URL."'". $att_TITLE ." dateStamp='".date("Y-m-d H:i:s")."' gateProccessed='false'>".$element_KEYWORDS. $element_TEXT. "</site>";
        $file_handle = fopen($fileFullPath, "w");

        if($file_handle==false){
	        die("unable to create file");
        }else{
            fwrite($file_handle, $file_CONTENT);
            fclose($file_handle);
            
            ini_set('max_execution_time', 0);
            $command = "java -jar ../java/application.jar ". $fileName ." ".$_POST['onlyC']." ".$_POST['minF']." ".$_POST['maxF']." ".$_POST['minL']." ".$_POST['maxL'];
            $fullResult = shell_exec($command);
            $output = "file=". $fileName."|result=". $fullResult;
            echo json_encode($output);           
        }
    }else if (isset($_GET['cluster']) && $_GET['cluster']){
            if($_GET['category'] == "true"){
                $mode = "true";
            }else{
                $mode = "false";
            }
            
            ini_set('max_execution_time', 0);
            $command = "java -jar ../java/application.jar true ".$mode;
            $fullResult = shell_exec($command);  
            echo $fullResult;
       
    }else if(isset($_GET['clear']) && $_GET['clear']){
        $files = glob(FOLDER_PATH."*"); // get all file names
        foreach($files as $file){ // iterate files
          if(is_file($file))
            unlink($file); // delete file
        }
    }
?>