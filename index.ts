#!/usr/bin/env node
import { program } from 'commander';
import { getParam } from './options';
import {fileSearch} from './changePackage';
getParam(program);
program.parse(process.argv);
const options = program.opts();
fileSearch(String(options.projectPath),options);
