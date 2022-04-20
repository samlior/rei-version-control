import * as fs from 'fs';
import * as path from 'path';
import readLine = require("readline");
const replaceFile ='package.json';
const  ignoreFile = 'node_modules'
// const replaceFile ='hello.txt';
// 读取文件
function fsReadDir(dir: string) {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) reject(err);
            resolve(files);
        });
    });
}
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
    const files = await fsReadDir(dirPath);
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
                replace(datas.files[datas.stats.indexOf(stat)],opts)
            }
        }
    });
}
function replace(fileName: string,opts: { [option: string]: string }) {
    let arr: string[] = [];
    let readObj = readLine.createInterface({
        input: fs.createReadStream(fileName)
    });
    // 按行读取文件
    readObj.on('line', function (line) {
        arr.push(line);
    });
    readObj.on('close', function () {
        let tempArr: string[] = [];
        arr.forEach((ele: string,index:number) => {
            // console.log("file: ",String(ele).split(":")[0].trim());
            // console.log("changeFile: ",('"'+ String(opts.library) + '"'));
            // console.log("true/false:",String(ele).split(":")[0] == ('"'+ String(opts.library) + '"'));
            if (String(ele).split(":")[0].trim() == ('"'+ String(opts.library) + '"')){
                let line = ele.split(":")[0] + ': "' + opts.newVersion +'"'
                if (arr[index+1].trim() != '}' && arr[index+1].trim() != '},'){
                    line = line + ","
                }
                tempArr.push(line);
                console.log("变更文件: ",fileName,"  history version: ",String(ele).split(":")[1].trim(),"  current version: ",opts.newVersion);
            }else {
                tempArr.push(ele);
            }
        });
        fs.writeFile(fileName, tempArr.join("\n"),
            function (err) {
                if (err) throw err;
            });
    });
}
