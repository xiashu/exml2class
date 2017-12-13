import * as wing from 'wing';
import * as path from 'path';
import * as fs from 'fs';
import {PopupType, Store, IStoreMap, IStoreSchema, IStoreSchemaMap, IFormOptions} from 'wing';

export function action(filePath:string,extendPath:string,ids:string,skinName:string): void {
     
	var curfileStr = fs.readFileSync(extendPath+"/out/config.json","utf-8");
    var json = JSON.parse(curfileStr);
    var items: string[]  = json["class"]; 

	scheme["select"]["enum"]  = items;
	scheme["select"]["default"] = items[0];

    var mItems = getSelectList(json);
    scheme["mselect"]["enum"] = mItems;
    scheme["mselect"]["default"] = mItems[0];

	wing.window.showPopup<IFormOptions>(PopupType.Form, new Store(properties, scheme), {
		title: '生成类'
	}).then((result) => {
		 if(!result) return;
        var className =  result.getValue("inputbox");//类名
		if(className==""){
		   wing.window.showErrorMessage("不能为空");
		   return;
	    }

        var extendsName =  result.getValue("select");//扩展名
		 
		var	moduleName = result.getValue("inputbox2");//模块名
	 
    
		var templeName =  result.getValue("mselect");
        var codeStr =  getTempleCode(extendPath+"/out/",json,templeName);
  
		if(className && extendsName)
		{
            createClassTemple(codeStr,filePath,ids,className,extendsName,skinName,moduleName);
		}
       
	});
}

//获取模板选项列
function getSelectList(json)
{
    var list =  json["temple"];
    var str:string[] =[];
    for(var i:number = 0;i<list.length;i++)
    {
        str.push(list[i].name);
    }
  return str;
}

//获取模板代码
function getTempleCode(extendPath:string,json:any,seletName:string)
{
   var list =  json["temple"];
    var str:string = "";
    for(var i:number = 0;i<list.length;i++)
    {
        if(list[i].name == seletName)
        {  
            var curPath   =  extendPath+"/"+list[i].url;
            var curfileStr = fs.readFileSync(curPath,"utf-8");
            return curfileStr;
        }
    }
    
  return str;

}



//创建类模板
function createClassTemple(content:string,filePath:string,ids:string,className:string,extendName:string,skinName:string,moduleName:string)
{
 
       var codeStr =  content.replace(/\$CLASS_NAME\$/g,className).replace(/\$EXTENDS_NAME\$/g,extendName).replace(/\$SKIN_NAME\$/g,skinName).replace(/\$MODULE_NAME\$/g,moduleName).replace(/\$IDS\$/g,ids);  

       var targetPath = "";
       if(process.platform =="win32")
       {
            targetPath = filePath.substring(0,filePath.lastIndexOf("\\")+1)+className+".ts";
       }
       else
       {
            targetPath = filePath.substring(0,filePath.lastIndexOf("/")+1)+className+".ts";
       }


	  if(fs.existsSync(targetPath))
       {
          wing.window.showWarningMessage("文件已经存在是否覆盖当前内容？","YES","NO").then(value=>{
              if(value =="YES")
              {
                  writeFile(targetPath,codeStr);
              }
         });
       }
       else
       {
           writeFile(targetPath,codeStr);
       }
}



//写文件
function writeFile(filePath:string,str:string){
  
 
  fs.writeFile(filePath,str,'utf-8',complete);
  function complete(error){
     if(!error)
     {
         wing.window.showInformationMessage("文件生成完成，请刷新一下");
     }
  }
}


const scheme: IStoreSchemaMap = {
 
	inputbox: {
		type: 'string',
		title: '类名',
		description: '输入对应的类名'
	},
	select: {
		type: 'string',
		title: '继承类',
		enum: ['one', 'two', 'three'],
		description: '选择下拉框'
	},
    mselect: {
		type: 'string',
		title: '模板',
		enum: ['one', 'two', 'three'],
		description: '选择模板'
	},
	inputbox2: {
		type: 'string',
		title: '模块名',
		description: '自定义模块名，该选项需要指定才填写'
	},
}

const properties = {
	inputbox: ''
}