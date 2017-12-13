import * as wing from 'wing';
import * as path from 'path';
import * as fs from 'fs';
import {QuickPickItem,TextEditorEdit} from "wing";
import {PopupType, Store, IStoreMap, IStoreSchema, IStoreSchemaMap, IFormOptions} from 'wing';

export function showPanel(extendPath:string,className:string,ids:string,skinName:string): void {
     
	var curfileStr = fs.readFileSync(extendPath+"/out/config.json","utf-8");
    var json = JSON.parse(curfileStr);
    var items: string[]  = json["class"]; 

      
    scheme["inputbox"]["default"] = className;

	scheme["select"]["enum"]  = items;
	scheme["select"]["default"] = items[0];

    var mItems = getSelectList(json);
    scheme["mselect"]["enum"] = mItems;
    scheme["mselect"]["default"] = mItems[0];

	wing.window.showPopup<IFormOptions>(PopupType.Form, new Store(properties, scheme), {
		title: '生成类'
	}).then((result) => {
		 if(!result) return;
   
        var extendsName =  result.getValue("select");//扩展名
		 
		var	moduleName = result.getValue("inputbox2");//模块名
	 
    
		var templeName =  result.getValue("mselect");
        var codeStr =  getTempleCode(extendPath+"/out/",json,templeName);
  
		if(className && extendsName)
		{
            createClassTemple(codeStr,ids,className,extendsName,skinName,moduleName);
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
function createClassTemple(content:string,ids:string,className:string,extendName:string,skinName:string,moduleName:string)
{
 
    var codeStr =  content.replace(/\$CLASS_NAME\$/g,className).replace(/\$EXTENDS_NAME\$/g,extendName).replace(/\$SKIN_NAME\$/g,skinName).replace(/\$MODULE_NAME\$/g,moduleName).replace(/\$IDS\$/g,ids);  

    let e = wing.window.activeTextEditor;
    if (!e) return;
  
   var curStr = e.document.getText();
   if(curStr!="")
   {
      wing.window.showWarningMessage("编辑区已经有文字内容是否清空？","YES","NO").then(value=>{        
      if(value=="YES")
     {
          wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                edit.delete(new wing.Range(new wing.Position(0,0),new wing.Position(Number.MAX_VALUE,Number.MAX_VALUE)));
                edit.insert(new wing.Position(0,0),codeStr);
            });   
        }
      });   
   }
   else{
          wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                edit.insert(new wing.Position(0,0),codeStr);
          });   
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
	 
}