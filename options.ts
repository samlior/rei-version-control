import {program} from "commander";

export function getParam(program: any) {
    program.option('-v,--version <newversion>', 'new version,major/minor/patch plus')
        .option('-l,--library <library>', 'change library')
        .option('-path,--project-path <projectpath>','project path');
}
