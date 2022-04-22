"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = void 0;
function getParam(program) {
    program.option('-v,--version <version>', 'new version,major/minor/patch plus')
        .option('-l,--library <library>', 'change library')
        .option('-path,--project-path <projectpath>', 'project path');
}
exports.getParam = getParam;
