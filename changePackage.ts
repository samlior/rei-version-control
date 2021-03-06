import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

const replaceFile = 'package.json';
const ignoreFile = 'node_modules';
export const majorVersion = 'major';
export const minorVersion = 'minor';
export const patchVersion = 'patch';
export const majorVersionIndex = 0;
export const minorVersionIndex = 1;
export const patchVersionIndex = 2;
//存储每个库被哪些库引用
export let packagesDependenciesMp = new Map();
//存储需要变更的库
export let needUpdateLibraryMp = new Map();
//我使用了哪些库
export let myLibraryMp = new Map();

//统计出需要变更的package
export function needUpdateLibrary(librarys: []) {
    for (const index in librarys) {
        needUpdateLibraryMp.set(librarys[index], 1);
        if (packagesDependenciesMp.has(librarys[index])) {
            needUpdateLibrary(packagesDependenciesMp.get(librarys[index]))
        }
    }
}

export async function updatePackageJson(version: string, library: string) {
    // console.log("myLibraryMp", myLibraryMp);
    for (const [key, value] of myLibraryMp) {
        const data = await fs.readFileSync(key);
        let p = JSON.parse(data.toString());
        let tmp = 0;//标记依赖是否被变更过,变更过则变更模块版本
        for (let i = 0; i < value.length; i++) {
            if (needUpdateLibraryMp.has(value[i])) {
                tmp = 1;
                let dependenciesVersionArr = p.dependencies[value[i]].split('.')
                //变更依赖版本
                switch (version) {
                    case majorVersion:
                        if (p.dependencies[value[i]].includes('^') || p.dependencies[value[i]].includes('~')) {
                            dependenciesVersionArr[majorVersionIndex] = p.dependencies[value[i]][0] + (Number(p.dependencies[value[i]][1]) + 1);
                        } else {
                            dependenciesVersionArr[majorVersionIndex] = Number(dependenciesVersionArr[majorVersionIndex]) + 1;
                        }
                        dependenciesVersionArr[minorVersionIndex] = 0;
                        dependenciesVersionArr[patchVersionIndex] = 0
                        break;
                    case minorVersion:
                        dependenciesVersionArr[minorVersionIndex] = Number(dependenciesVersionArr[minorVersionIndex]) + 1;
                        dependenciesVersionArr[patchVersionIndex] = 0
                        break;
                    case patchVersion:
                        dependenciesVersionArr[patchVersionIndex] = Number(dependenciesVersionArr[patchVersionIndex]) + 1
                        break;
                }
                p.dependencies[value[i]] = dependenciesVersionArr.join('.');
            }
        }
        if (tmp === 1 || p.name === library) {
            const historyVersion = p.version
            let versionArr = p.version.split('.');
            //变更模块版本
            switch (version) {
                case majorVersion:
                    versionArr[majorVersionIndex] = Number(versionArr[majorVersionIndex]) + 1;
                    versionArr[minorVersionIndex] = 0
                    versionArr[patchVersionIndex] = 0
                    break;
                case minorVersion:
                    versionArr[minorVersionIndex] = Number(versionArr[minorVersionIndex]) + 1;
                    versionArr[patchVersionIndex] = 0
                    break;
                case patchVersion:
                    versionArr[patchVersionIndex] = Number(versionArr[2]) + 1;
                    break;
            }
            p.version = versionArr.join('.');
            const str = JSON.stringify(p, null, '\t');
            await fsp.writeFile(key, str);
            console.log("updated package.json: ", key, "history version:", historyVersion, "current version:", p.version);
        }
    }
}

export async function updaeDependencies(dirPath: string) {
    const files = await fsp.readdir(dirPath)
    // const files = await fsReadDir(dirPath);
    const promises = files.map(file => {
        return fsp.stat(path.join(dirPath, file));
    });
    const datas = await Promise.all(promises).then(stats => {
        for (let i = 0; i < files.length; i += 1) files[i] = path.join(dirPath, files[i]);
        return {stats, files};
    });
    for (let i = 0; i < datas.stats.length; i++) {
        const isFile = datas.stats[i].isFile();
        const isDir = datas.stats[i].isDirectory();
        const pathArr = datas.files[i].split(path.sep);
        //如果是文件夹并且不是node_modules就继续递归文件夹
        if (isDir && pathArr[pathArr.length - 1] !== ignoreFile) {
            await updaeDependencies(datas.files[i]);
        }
        if (isFile) {
            if (pathArr[pathArr.length - 1] === replaceFile) {
                await searchRelyOn(datas.files[i])
            }
        }
    }
}

async function searchRelyOn(fileName: string) {
    const data = await fsp.readFile(fileName.trim(), 'utf-8');
    // console.log("file:",fileName);
    // console.log("data: ",data.toString());
    const p = JSON.parse(data.toString());
    if (p.dependencies != undefined) {
        for (const library in p.dependencies) {
            if (!packagesDependenciesMp.has(library)) {
                packagesDependenciesMp.set(library, []);
            }
            ;
            //统计出每个库被哪些其他库引用
            packagesDependenciesMp.get(library).push(p.name);
            //统计出自己使用了哪些库
            if (!myLibraryMp.has(fileName)) {
                myLibraryMp.set(fileName, []);
            }
            ;
            myLibraryMp.get(fileName).push(library);
        }
    }
}

