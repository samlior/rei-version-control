#!/usr/bin/env node
"use strict";
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
const commander_1 = require("commander");
const options_1 = require("./options");
// import {searchDependencies, updateLibrary} from './changePackage';
const changePackage_1 = require("./changePackage");
(0, options_1.getParam)(commander_1.program);
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
//两轮变更
let update = function () {
    return __awaiter(this, void 0, void 0, function* () {
        //统计依赖关系
        yield (0, changePackage_1.UpdaeDependencies)(String(options.projectPath), options);
        // console.log("统计完成------------------packetMp", packagesDependenciesMp);
        //统计需要变更的依赖
        changePackage_1.needUpdateLibraryMp.set(options.library, 1);
        yield (0, changePackage_1.needUpdateLibrary)(changePackage_1.packagesDependenciesMp.get(options.library));
        // console.log("需要变更的库:",needUpdateLibraryMp)
        //每个文件的依赖 和 需要变更的依赖 二者取交集来变更package.json
        yield (0, changePackage_1.updatePackageJson)(options);
        // updateLibrary(options)
    });
};
update();
