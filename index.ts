#!/usr/bin/env node
import {program} from 'commander';
import {getParam} from './options';
import {
    UpdaeDependencies,
    needUpdateLibraryMp,
    packagesDependenciesMp,
    needUpdateLibrary,
    updatePackageJson
} from './changePackage';

getParam(program);
program.parse(process.argv);
const options = program.opts();
const path = program.opts().projectPath;
const version = program.opts().version;
const library = program.opts().library;
let update = async function () {
    //统计依赖关系
    await UpdaeDependencies(path);
    // console.log("统计完成------------------packetMp", packagesDependenciesMp);
    //统计需要变更的依赖
    needUpdateLibraryMp.set(options.library, 1);
    await needUpdateLibrary(packagesDependenciesMp.get(options.library))
    // console.log("需要变更的库:",needUpdateLibraryMp)
    //每个文件的依赖 和 需要变更的依赖 二者取交集来变更package.json
    await updatePackageJson(version, library)
}
update();

