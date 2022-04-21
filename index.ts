#!/usr/bin/env node
import { program } from 'commander';
import { getParam } from './options';
import {fileSearch} from './changePackage';

getParam(program);
program.parse(process.argv);
const options = program.opts();
//两轮变更
let Delay_Time = function(ms: any) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms)
    } )
}
let k = async function (){
    // console.log("开始第一轮变更")
    await fileSearch(String(options.projectPath),options);
    await Delay_Time(3000);
    // console.log("开始第二轮变更")
    await fileSearch(String(options.projectPath),options);
}
k();

