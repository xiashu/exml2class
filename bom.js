var fs = require('fs');

var content =  fs.readFileSync("package.json",'utf-8');
if(content && content.charAt(0)=="\ufeff")
{
     content = content.substring(1);
}

writeFile("pack.json",content);

function writeFile(filePath,str){
  
 
  fs.writeFile(filePath,str,'utf-8',complete);
  function complete(error){
     if(!error)
     {
         console.log("文件去bom头成功");
     }
  }
}