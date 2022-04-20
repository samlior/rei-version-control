import {program} from "commander";

export function getParam(program: any) {
    program.option('-v,--new-version <newversion>', 'new version')
        .option('-l,--library <library>', 'change library')
        .option('-path,--project-path <projectpath>','project path');
}
