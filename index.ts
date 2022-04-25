#!/usr/bin/env node
import {program} from 'commander';
import {getParam} from './options';
import {
    needUpdateLibraryMp,
    packagesDependenciesMp,
    updaeDependencies,
    needUpdateLibrary,
    updatePackageJson
} from './changePackage';

getParam(program);
program.parse(process.argv);
const path = program.opts().projectPath;
const version = program.opts().version;
const library = program.opts().library;
let update = async function () {
    //统计依赖关系
    await updaeDependencies(path);
    // console.log("统计完成packetMp:", packagesDependenciesMp);
    //统计需要变更的依赖
    needUpdateLibraryMp.set(library, 1);
    await needUpdateLibrary(packagesDependenciesMp.get(library))
    // console.log("需要变更的库:", needUpdateLibraryMp)
    //每个文件的依赖 和 需要变更的依赖 二者取交集来变更package.json
    await updatePackageJson(version, library)
}
update();

