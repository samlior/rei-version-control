import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
const  replaceFile = 'package.json';
const  ignoreFile = 'node_modules';
let  libiraryOldVersion = '';
let  updatedLibrayVersion = '';
let updatedMp = new Map();
// 读取文件
// function fsReadDir(dir: string) {
//     return new Promise<string[]>((resolve, reject) => {
//         fs.readdir(dir, (err, files) => {
//             if (err) reject(err);
//             resolve(files);
//         });
//     });
// }
// 获取stat
function fsStat(path: string) {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) reject(err);
            resolve(stat);
        });
    });
}
// 搜索文件
export async function fileSearch(dirPath: string,opts: { [option: string]: string }) {
    let files = await fsp.readdir(dirPath)
    // const files = await fsReadDir(dirPath);
    const promises = files.map(file => {
        return fsStat(path.join(dirPath, file));
    });
    const datas = await Promise.all(promises).then(stats => {
        for (let i = 0; i < files.length; i += 1) files[i] = path.join(dirPath, files[i]);
        return { stats, files };
    });
    datas.stats.forEach(stat => {
        const isFile = stat.isFile();
        const isDir = stat.isDirectory();
        let pathArr = datas.files[datas.stats.indexOf(stat)].split("/");
        //如果是文件夹并且不是node_modules就继续递归文件夹
        if (isDir && pathArr[pathArr.length-1] != ignoreFile) {
            fileSearch(datas.files[datas.stats.indexOf(stat)],opts);
        }
        if (isFile) {
            if (pathArr[pathArr.length-1] == replaceFile){
                // console.log("发现需要变更的文件",datas.files[datas.stats.indexOf(stat)])
                updateLibraryVersionPlus(datas.files[datas.stats.indexOf(stat)],opts)
            }
        }
    });
}
//变更package.json
function updateLibraryVersionPlus(fileName: string,opts: { [option: string]: string }){
    if (!updatedMp.has(fileName)){//更新完的文件第二轮将不再打开
        fs.readFile(fileName.trim(),'utf-8',(err,data)=>{
            if (err){
                throw  err;
            }
            // console.log("file:",fileName);
            // console.log("data: ",data.toString());
            let p = JSON.parse(data.toString());
            let historyVersion = p.version;
            if (p.name == opts.library && updatedLibrayVersion == ''){
                let versionArr = p.version.split(".");
                //历史版本保存下来用于日志打印
                libiraryOldVersion = p.version
                switch (opts.version){
                    case 'major':
                        versionArr[0] = Number(versionArr[0]) + 1;
                        versionArr[1] = 0
                        versionArr[2] = 0
                        break;
                    case 'minor':
                        versionArr[1] = Number(versionArr[1]) + 1;
                        versionArr[2] = 0
                        break;
                    case 'patch':
                        versionArr[2] = Number(versionArr[2]) + 1;
                        break;
                }
                p.version = versionArr.join('.');
                //把变更后的版本记录下来,后续根据保存的数据变更使用到该模块的模块的package.json
                updatedLibrayVersion = p.version;
                console.log("updated file: ",fileName,"  history version: ",historyVersion,"  current version: ",updatedLibrayVersion);
                updatedMp.set(fileName,1);
                //在需要更新版本的模块更新完毕后才开始更新使用到该模块的模块
            } else if (p.dependencies != undefined){
                if (p.dependencies[opts.library] != undefined && updatedLibrayVersion != ''){
                    if (p.dependencies[opts.library].includes('^') || p.dependencies[opts.library].includes('~')){
                        p.dependencies[opts.library] = p.dependencies[opts.library][0] + updatedLibrayVersion;
                    }else {
                        p.dependencies[opts.library] = updatedLibrayVersion;
                    }
                    let versionArr = p.version.split('.');
                    switch (opts.version){
                        case 'major':
                            versionArr[0] = Number(versionArr[0]) + 1;
                            versionArr[1] = 0
                            versionArr[2] = 0
                            break;
                        case 'minor':
                            versionArr[1] = Number(versionArr[1]) + 1;
                            versionArr[2] = 0
                            break;
                        case 'patch':
                            versionArr[2] = Number(versionArr[2]) + 1;
                            break;
                    }
                    p.version = versionArr.join('.');
                    console.log("updated file: ",fileName,"  history version: ",historyVersion,"  current version: ",p.version);
                    updatedMp.set(fileName,1);
                }
            }
            let str = JSON.stringify(p,null,'\t');
            fs.writeFile(fileName,str,function(err){
                if(err){
                    console.error(err);
                }
            })
        })
    }
}
