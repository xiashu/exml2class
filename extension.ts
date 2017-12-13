import * as wing from 'wing';
import * as path from 'path';
import * as fs from 'fs';
import {QuickPickItem,TextEditorEdit} from "wing";
import * as showPopup from "./showPopup";
import * as showCreatePanel from "./showCreatePanel";
import * as exmlconfig from "./exmlconfig";

let extendPath = "";//扩展路径
let configPath = "";//配置路径
let globalPath = "";//文件路径
export function activate(context: wing.ExtensionContext) {

    extendPath = context.extensionPath;  
    configPath = path.join(context.extensionPath,"/out/config.json");
    wing.commands.registerCommand("extension.exml2class", onCopyexmlIds);
    wing.commands.registerCommand("extension.exml2classex", onExml2Class);
    wing.commands.registerCommand("extension.exml2classeConfig", onSetConfig);
    wing.commands.registerCommand("extension.exml2classeimport", onQuickImport);
    wing.commands.registerCommand("extension.exml2classerefresh", onRefresh);
    init();
}

function  init() {	
     var statusbaritem = wing.window.createStatusBarItem(wing.StatusBarAlignment.Left);
    statusbaritem.text = "RefreshId";
    statusbaritem.command = "extension.exml2classerefresh";
    statusbaritem.show(); //显示状态栏，hide则为隐藏状态栏
}




//进行配置
function  onSetConfig(){

  wing.workspace.openTextDocument(configPath).then(doc=>{   
    wing.window.showTextDocument(doc);
  });

}

//鼠标右键处理
function onExml2Class(uri:wing.Uri)
{

   if(uri && uri.fsPath)  
   {
       //这里弹出相应的交互，生成对应的文件
       var fsPath = uri.fsPath;     
        var curfileStr = fs.readFileSync(fsPath,"utf-8");
       let ids = findIds(curfileStr);
       var skinName = getSkinClassName(curfileStr);
       showPopup.action(fsPath,extendPath,ids,skinName);
   }
}


//快速导入
function onRefresh(){

    let rootPath =  wing.workspace.rootPath;
    if(!rootPath) return; 
    var filePath = rootPath+"/.wing/exml2class.json";
   if(fs.existsSync(filePath))
   {
       var className = getClassName();
       var exmlPath = exmlconfig.read(filePath,className);//读取配置中exml路径
       if(!exmlPath){
            onQuickImport();
           return;
       }
       var curfileStr = fs.readFileSync(exmlPath,"utf-8");
       let ids = findIds(curfileStr);
       
       //替换区域
       var e = wing.window.activeTextEditor.document;
       var allContent = e.getText();
       var array= allContent.match(/[\r\n]\s*\/[\/]+exml2class:开始替换声明区域[\s\S]*[\r\n]\s*\/[\/]+exml2class:结束替换声明区域[^\n\n]+/);
       if(array && array.length >0)
       {
            allContent = allContent.replace(/[\r\n]\s*\/[\/]+exml2class:开始替换声明区域[\s\S]*[\r\n]\s*\/[\/]+exml2class:结束替换声明区域[^\n\n]+/,formatIds(ids));
             wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                edit.delete(new wing.Range(new wing.Position(0,0),new wing.Position(Number.MAX_VALUE,Number.MAX_VALUE)));
                edit.insert(new wing.Position(0,0),allContent);
        });  
       }
       else
       {
           wing.window.showWarningMessage("是否添加Exml2Class声明格式","YES","NO").then(value=>{        
            if(value=="YES")
            {
                wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                       var line =  wing.window.activeTextEditor.selection.active.line;
                        edit.insert(new wing.Position(line,0),formatIds(ids));
                    });   
            }
            else if(value=="NO")
            {
                wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                    var line =  wing.window.activeTextEditor.selection.active.line;
                    edit.insert(new wing.Position(line,0),ids);
                });   
            }
            });   
       }
   }
   else
   {
      onQuickImport();    
   }
 
}


function onQuickImport(){

   let e = wing.window.activeTextEditor;
    if (!e) {
        return;
    }

    let rootPath =  wing.workspace.rootPath;
    if(!rootPath) return; 

    wing.workspace.findFiles('**/*.exml','**/{libs,.wing,bin-debug,template,bin-release}/**').then((value:wing.Uri[])=>{
                              
           var items: QuickPickItem[] = [];
           value.forEach(element => {
               
                var obj:QuickPickItem= {label:"",description:""};
                obj.label = path.basename(element.fsPath);
                obj.detail =  element.fsPath;  
                items.push(obj);          
           });
        
           ParseExml(items);
    })



}

function ParseExml(items:QuickPickItem[]){

  wing.window.showQuickPick(items).then((selection) => {
       if(!selection)  return;

       var fsPath = selection.detail; 
       var curfileStr = fs.readFileSync(fsPath,"utf-8");
       let ids = findIds(curfileStr);
       
       //替换区域
       var e = wing.window.activeTextEditor.document;
       var allContent = e.getText();
       var array= allContent.match(/[\r\n]\s*\/[\/]+exml2class:开始替换声明区域[\s\S]*[\r\n]\s*\/[\/]+exml2class:结束替换声明区域[^\n\n]+/);
       if(array && array.length >0)
       {
            allContent = allContent.replace(/[\r\n]\s*\/[\/]+exml2class:开始替换声明区域[\s\S]*[\r\n]\s*\/[\/]+exml2class:结束替换声明区域[^\n\n]+/,formatIds(ids));
             wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                edit.delete(new wing.Range(new wing.Position(0,0),new wing.Position(Number.MAX_VALUE,Number.MAX_VALUE)));
                edit.insert(new wing.Position(0,0),allContent);
                var exmlPath = fsPath.replace(wing.workspace.rootPath,'');
                exmlconfig.write({"key":getClassName(),"exmlPath":exmlPath});//写入配置
        });  
       }
       else
       {
           wing.window.showWarningMessage("是否添加Exml2Class声明格式","YES","NO").then(value=>{        
            if(value=="YES")
            {
                wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                       var line =  wing.window.activeTextEditor.selection.active.line;
                        edit.insert(new wing.Position(line,0),formatIds(ids));
                         var exmlPath = fsPath.replace(wing.workspace.rootPath,'');
                         exmlconfig.write({"key":getClassName(),"exmlPath":exmlPath});//写入配置
                    });   
            }
            else if(value=="NO")
            {
                wing.window.activeTextEditor.edit(function(edit:TextEditorEdit){     
                    var line =  wing.window.activeTextEditor.selection.active.line;
                    edit.insert(new wing.Position(line,0),ids);
                });   
            }
            });   
       }
    });

}


function formatIds(ids:string)
{
 var startStr ="\n////////////////////////////exml2class:开始替换声明区域///////////////////////////////\n"+
               "$IDS$"+
              "////////////////////////////exml2class:结束替换声明区域///////////////////////////////";
return  startStr.replace(/\$IDS\$/,ids);
}




 //展示EXML列表
function onCopyexmlIds(){

     let e = wing.window.activeTextEditor;
    if (!e) {
        return;
    }

    let rootPath =  wing.workspace.rootPath;
    if(!rootPath) return; 

    wing.workspace.findFiles('**/*.exml','**/{libs,.wing,bin-debug,template,bin-release}/**').then((value:wing.Uri[])=>{
                              
           var items: QuickPickItem[] = [];
           value.forEach(element => {
               
                var obj:QuickPickItem= {label:"",description:""};
                obj.label = path.basename(element.fsPath);
                obj.description =  element.fsPath;  
                items.push(obj);          
           });
        
           showResult(items);
    })
  
}

function showResult(items:QuickPickItem[]){

  wing.window.showQuickPick(items).then((selection) => {
       if(!selection)  return;

       var fsPath = selection.description; 
       var curfileStr = fs.readFileSync(fsPath,"utf-8");
       let ids = findIds(curfileStr);
       var skinName = getSkinClassName(curfileStr);
       var className = getClassName();
       showCreatePanel.showPanel(extendPath,className,ids,skinName);
    });

}

//获取对应的exml皮肤类名
function getSkinClassName(xml:string):string
{
  
    var array = xml.match(/class=\"(.*?)\"/);
    if (array && array[1])
     {
         var className = array[1];
         return className;
     }

  return "";
}

//获取对应的文件名
function getClassName():string
{
    var fileName =  wing.window.activeTextEditor.document.fileName;
    if(process.platform =="win32")
    {
          fileName = fileName.substring(fileName.lastIndexOf("\\")+1,fileName.lastIndexOf("."));
    }else
    {
         fileName = fileName.substring(fileName.lastIndexOf("/")+1,fileName.lastIndexOf("."));
    }
   
    return fileName;
}


function isExml(params:string) {
   if(path.extname(params) ==".exml")
   {
      return true;
   }
   return false;
}

 

function findIds(text: string): string {
    let lines = text.split(/[\r\n(\r\n)]/);
    let nss = findNameSpaces(lines.join(" "));
    let idexp = / id=\"(.*?)\"/ig;
    let result = "";
    let uimodule = 'eui.';//is_eui(text) ? 'eui.' : 'egret.gui.';//没有gui不用再判断
    let mapKey = {};//过滤重复选项
    lines.forEach(line => {
        let temp = line.match(idexp);

        if (temp && temp.length > 0) {

            let classDefine = line.match(/<(.+?):(.+?) /);
            if (classDefine.length < 3) {
                return;
            }
            
            let classModule;
           
            if (classDefine[1] == "e") {
                classModule = uimodule;
            } else {
                classModule = nss[classDefine[1]];
                classModule = classModule.substring(0, classModule.length - 1);
            }
            let className = classDefine[2];
            if (classDefine[1] != "w" && classDefine[1] != "Config")
            {
                 let id = temp[0].replace(' id=', '').replace('"', '').replace('"', '');
                 if(!mapKey[id]){
                     mapKey[id] = 1;//过滤重复项
                     result += `\tprivate #1: ${classModule}#2;`.replace('#1', id).replace('#2', className) + '\n';
                 }
                
            }
          
        }
    });
    
    mapKey = null;
    return result;
}

function findNameSpaces(text: string): any {
    var map = {};
    var names = text.match(/xmlns:(.+?)="(.+?)"/g);
    names.forEach((name) => {
        var result = name.match(/xmlns:(.+?)="(.+?)"/);
        if (result.length == 3) {
            map[result[1]] = result[2];
        }
    });
    return map;
}

function is_eui(text: string): boolean {
    if (text.indexOf('xmlns:e="http://ns.egret.com/eui"') > 0) {
        return true;
    } else {
        return false;
    }
}
