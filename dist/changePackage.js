"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdaeDependencies = exports.updatePackageJson = exports.needUpdateLibrary = exports.needUpdateLibraryMp = exports.packagesDependenciesMp = void 0;
const fs = __importStar(require("fs"));
const fsp = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const replaceFile = 'package.json';
const ignoreFile = 'node_modules';
let libiraryOldVersion = '';
let updatedLibrayVersion = '';
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
function fsStat(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err)
                reject(err);
            resolve(stat);
        });
    });
}
//存储每个库被哪些库引用
exports.packagesDependenciesMp = new Map();
//存储需要变更的库
exports.needUpdateLibraryMp = new Map();
//我使用了哪些库
let myLibraryMp = new Map();
// let packagesMp = new Map();
//统计出需要变更的package
function needUpdateLibrary(librarys) {
    for (let index in librarys) {
        exports.needUpdateLibraryMp.set(librarys[index], 1);
        if (exports.packagesDependenciesMp.has(librarys[index])) {
            needUpdateLibrary(exports.packagesDependenciesMp.get(librarys[index]));
        }
    }
}
exports.needUpdateLibrary = needUpdateLibrary;
function updatePackageJson(opts) {
    // console.log("myLibraryMp", myLibraryMp);
    for (var [key, value] of myLibraryMp) {
        let data = fs.readFileSync(key);
        let p = JSON.parse(data.toString());
        let tmp = 0;
        for (let i = 0; i < value.length; i++) {
            if (exports.needUpdateLibraryMp.has(value[i])) {
                tmp = 1;
                let dependenciesVersionArr = p.dependencies[value[i]].split('.');
                //变更依赖版本
                switch (opts.version) {
                    case 'major':
                        //变更依赖版本
                        if (p.dependencies[value[i]].includes('^') || p.dependencies[value[i]].includes('~')) {
                            dependenciesVersionArr[0] = p.dependencies[value[i]][0] + (Number(p.dependencies[value[i]][1]) + 1);
                        }
                        else {
                            dependenciesVersionArr[0] = Number(dependenciesVersionArr[0]) + 1;
                        }
                        dependenciesVersionArr[1] = 0;
                        dependenciesVersionArr[2] = 0;
                        break;
                    case 'minor':
                        dependenciesVersionArr[1] = Number(dependenciesVersionArr[1]) + 1;
                        dependenciesVersionArr[2] = 0;
                        break;
                    case 'patch':
                        dependenciesVersionArr[2] = Number(dependenciesVersionArr[2]) + 1;
                        break;
                }
                p.dependencies[value[i]] = dependenciesVersionArr.join('.');
            }
        }
        if (tmp == 1 || p.name == opts.library) {
            let historyVersion = p.version;
            let versionArr = p.version.split('.');
            switch (opts.version) {
                case 'major':
                    //变更主版本
                    versionArr[0] = Number(versionArr[0]) + 1;
                    versionArr[1] = 0;
                    versionArr[2] = 0;
                    break;
                case 'minor':
                    versionArr[1] = Number(versionArr[1]) + 1;
                    versionArr[2] = 0;
                    break;
                case 'patch':
                    versionArr[2] = Number(versionArr[2]) + 1;
                    break;
            }
            p.version = versionArr.join('.');
            console.log("updated package.json: ", key, "history version:", historyVersion, "current version:", p.version);
        }
        let str = JSON.stringify(p, null, '\t');
        fs.writeFile(key, str, function (err) {
            if (err) {
                console.error(err);
            }
        });
    }
}
exports.updatePackageJson = updatePackageJson;
function UpdaeDependencies(dirPath, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = yield fsp.readdir(dirPath);
        // const files = await fsReadDir(dirPath);
        const promises = files.map(file => {
            return fsStat(path.join(dirPath, file));
        });
        const datas = yield Promise.all(promises).then(stats => {
            for (let i = 0; i < files.length; i += 1)
                files[i] = path.join(dirPath, files[i]);
            return { stats, files };
        });
        for (let i = 0; i < datas.stats.length; i++) {
            const isFile = datas.stats[i].isFile();
            const isDir = datas.stats[i].isDirectory();
            let pathArr = datas.files[datas.stats.indexOf(datas.stats[i])].split("/");
            //如果是文件夹并且不是node_modules就继续递归文件夹
            if (isDir && pathArr[pathArr.length - 1] != ignoreFile) {
                yield UpdaeDependencies(datas.files[datas.stats.indexOf(datas.stats[i])], opts);
            }
            if (isFile) {
                if (pathArr[pathArr.length - 1] == replaceFile) {
                    // packagesMp.set(datas.files[datas.stats.indexOf((datas.stats[i]))],[])
                    yield searchRelyOn(datas.files[datas.stats.indexOf(datas.stats[i])]);
                }
            }
        }
        // console.log("统计完成------------------packetMp", packagesDependenciesMp);
        // //统计出哪些库需要变更
        // needUpdateLibraryMp.set(opts.library, 1);
        // await needUpdateLibrary(packagesDependenciesMp.get(opts.library))
        // //变更package.json
        // await updatePackageJson(opts)
    });
}
exports.UpdaeDependencies = UpdaeDependencies;
function searchRelyOn(fileName) {
    fs.readFile(fileName.trim(), 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        // console.log("file:",fileName);
        // console.log("data: ",data.toString());
        let p = JSON.parse(data.toString());
        if (p.dependencies != undefined) {
            for (let library in p.dependencies) {
                if (!exports.packagesDependenciesMp.has(library)) {
                    exports.packagesDependenciesMp.set(library, []);
                }
                ;
                //统计出每个库被哪些其他库引用
                exports.packagesDependenciesMp.get(library).push(p.name);
                //统计出自己使用了哪些库
                if (!myLibraryMp.has(fileName)) {
                    myLibraryMp.set(fileName, []);
                }
                ;
                myLibraryMp.get(fileName).push(library);
            }
        }
        let str = JSON.stringify(p, null, '\t');
        fs.writeFile(fileName, str, function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
}
// 搜索文件
// export async function fileSearch(dirPath: string, opts: { [option: string]: string }) {
//     let files = await fsp.readdir(dirPath)
//     // const files = await fsReadDir(dirPath);
//     const promises = files.map(file => {
//         return fsStat(path.join(dirPath, file));
//     });
//     const datas = await Promise.all(promises).then(stats => {
//         for (let i = 0; i < files.length; i += 1) files[i] = path.join(dirPath, files[i]);
//         return {stats, files};
//     });
//     datas.stats.forEach(stat => {
//         const isFile = stat.isFile();
//         const isDir = stat.isDirectory();
//         let pathArr = datas.files[datas.stats.indexOf(stat)].split("/");
//         //如果是文件夹并且不是node_modules就继续递归文件夹
//         if (isDir && pathArr[pathArr.length - 1] != ignoreFile) {
//             fileSearch(datas.files[datas.stats.indexOf(stat)], opts);
//         }
//         if (isFile) {
//             if (pathArr[pathArr.length - 1] == replaceFile) {
//                 // console.log("发现需要变更的文件",datas.files[datas.stats.indexOf(stat)])
//                 updateLibraryVersionPlus(datas.files[datas.stats.indexOf(stat)], opts)
//             }
//         }
//     });
// }
//
// //变更package.json
// function updateLibraryVersionPlus(fileName: string, opts: { [option: string]: string }) {
//     if (!updatedMp.has(fileName)) {//更新完的文件第二轮将不再打开
//         fs.readFile(fileName.trim(), 'utf-8', (err, data) => {
//             if (err) {
//                 throw  err;
//             }
//             console.log("file:", fileName);
//             console.log("data: ", data.toString());
//             let p = JSON.parse(data.toString());
//             let historyVersion = p.version;
//             if (p.name == opts.library && updatedLibrayVersion == '') {
//                 let versionArr = p.version.split(".");
//                 //历史版本保存下来用于日志打印
//                 libiraryOldVersion = p.version
//                 switch (opts.version) {
//                     case 'major':
//                         versionArr[0] = Number(versionArr[0]) + 1;
//                         versionArr[1] = 0
//                         versionArr[2] = 0
//                         break;
//                     case 'minor':
//                         versionArr[1] = Number(versionArr[1]) + 1;
//                         versionArr[2] = 0
//                         break;
//                     case 'patch':
//                         versionArr[2] = Number(versionArr[2]) + 1;
//                         break;
//                 }
//                 p.version = versionArr.join('.');
//                 //把变更后的版本记录下来,后续根据保存的数据变更使用到该模块的模块的package.json
//                 updatedLibrayVersion = p.version;
//                 console.log("updated file: ", fileName, "  history version: ", historyVersion, "  current version: ", updatedLibrayVersion);
//                 updatedMp.set(fileName, 1);
//                 //在需要更新版本的模块更新完毕后才开始更新使用到该模块的模块
//             } else if (p.dependencies != undefined) {
//                 if (p.dependencies[opts.library] != undefined && updatedLibrayVersion != '') {
//                     if (p.dependencies[opts.library].includes('^') || p.dependencies[opts.library].includes('~')) {
//                         p.dependencies[opts.library] = p.dependencies[opts.library][0] + updatedLibrayVersion;
//                     } else {
//                         p.dependencies[opts.library] = updatedLibrayVersion;
//                     }
//                     let versionArr = p.version.split('.');
//                     switch (opts.version) {
//                         case 'major':
//                             versionArr[0] = Number(versionArr[0]) + 1;
//                             versionArr[1] = 0
//                             versionArr[2] = 0
//                             break;
//                         case 'minor':
//                             versionArr[1] = Number(versionArr[1]) + 1;
//                             versionArr[2] = 0
//                             break;
//                         case 'patch':
//                             versionArr[2] = Number(versionArr[2]) + 1;
//                             break;
//                     }
//                     p.version = versionArr.join('.');
//                     console.log("updated file: ", fileName, "  history version: ", historyVersion, "  current version: ", p.version);
//                     updatedMp.set(fileName, 1);
//                 }
//             }
//             let str = JSON.stringify(p, null, '\t');
//             fs.writeFile(fileName, str, function (err) {
//                 if (err) {
//                     console.error(err);
//                 }
//             })
//         })
//     }
// }
