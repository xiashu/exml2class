

import * as wing from 'wing';
import * as path from 'path';
import * as fs from 'fs';


//读取配置的
export function write(data:any){

    let rootPath =  wing.workspace.rootPath;
    if(!rootPath) return; 
    var filePath = rootPath+"/.wing/exml2class.json";
   if(fs.existsSync(filePath))
   {
        var exmldata = fs.readFileSync(filePath,"utf-8");
        var json = JSON.parse(exmldata);
        json[data.key] = data.exmlPath;
        var str = JSON.stringify(json);
        writeFile(filePath,str);
   }
   else
   {
      var obj={}
      obj[data.key] = data.exmlPath;
      var str = JSON.stringify(obj);
      writeFile(filePath,str);
   }
}


//写文件
function writeFile(filePath:string,str:string){
  
  fs.writeFile(filePath,str,'utf-8',complete);
  function complete(error){
     if(error)
     {
         wing.window.showErrorMessage("文件生成配置有错，检测一下.wing目录下exml2class.json配置");
     }
  }
}


//读取配置的路径
export function read(filePath:string,key:string){

  var data = fs.readFileSync(filePath,"utf-8");
  var json = JSON.parse(data);
  if(json[key])
  {  
      if(fs.existsSync(wing.workspace.rootPath+json[key]))
      {
            var rootPath =  wing.workspace.rootPath+json[key];
            return rootPath;
      }
  }
  return null;

}