import {expect} from "chai";
import * as fs from "fs";
import path from "path";
import {
    packagesDependenciesMp,
    needUpdateLibraryMp,
    majorVersion,
    minorVersion,
    patchVersion,
    majorVersionIndex,
    minorVersionIndex,
    patchVersionIndex,
    updaeDependencies,
    updatePackageJson,
    needUpdateLibrary, myLibraryMp
} from "../changePackage";

const fileDir = 'test' + path.sep + 'packageJson-test';
const updateLibrary = '@rei-network/utils';
const test01 = 'test' + path.sep + 'packageJson-test' + path.sep + 'test01' + path.sep + 'package.json';
const test02 = 'test' + path.sep + 'packageJson-test' + path.sep + 'test02' + path.sep + 'package.json';
const test03 = 'test' + path.sep + 'packageJson-test' + path.sep + 'test03' + path.sep + 'package.json';
describe('updatePackageJson', () => {
    it('update majorVersion', async () => {
        let historyP = await saveHistory();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(majorVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(majorVersion, historyP);
        clear()
    });
    it('update minorVersion', async () => {
        let historyP = await saveHistory();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(minorVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(minorVersion,historyP);
        clear()
    });
    it('update patchVersion', async () => {
        let historyP = await saveHistory();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(patchVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(patchVersion,historyP);
        clear()
    });
});

function clear() {
    packagesDependenciesMp.clear();
    needUpdateLibraryMp.clear();
    myLibraryMp.clear();
}

function saveHistory() {
    const historyData1 = fs.readFileSync(test01)
    const historyData2 = fs.readFileSync(test02)
    const historyData3 = fs.readFileSync(test03)
    const historyP1 = JSON.parse(historyData1.toString());
    const historyP2 = JSON.parse(historyData2.toString());
    const historyP3 = JSON.parse(historyData3.toString());
    let historyP: any[] = [];
    historyP.push(historyP1,historyP2,historyP3);
    return historyP;
}

function checkVersion(updateVersionType: string, historyP: any[]) {
    let historyP1VersionArr = historyP[0].version.split('.')
    let historyP2VersionArr = historyP[1].version.split('.')
    let historyP3VersionArr = historyP[2].version.split('.')
    let historyP2dependenciesArr = historyP[1].dependencies[updateLibrary].split('.')
    let historyP3dependenciesArr = historyP[2].dependencies[updateLibrary].split('.')
    const currentData1 = fs.readFileSync(test01);
    const currentData2 = fs.readFileSync(test02);
    const currentData3 = fs.readFileSync(test03);
    const currentP1 = JSON.parse(currentData1.toString());
    const currentP2 = JSON.parse(currentData2.toString());
    const currentP3 = JSON.parse(currentData3.toString());
    switch (updateVersionType) {
        case majorVersion:
            historyP1VersionArr[majorVersionIndex] = Number(historyP1VersionArr[majorVersionIndex]) + 1;
            historyP1VersionArr[minorVersionIndex] = 0;
            historyP1VersionArr[patchVersionIndex] = 0;
            historyP2VersionArr[majorVersionIndex] = Number(historyP2VersionArr[majorVersionIndex]) + 1;
            historyP2VersionArr[minorVersionIndex] = 0;
            historyP2VersionArr[patchVersionIndex] = 0;
            historyP3VersionArr[majorVersionIndex] = Number(historyP3VersionArr[majorVersionIndex]) + 1;
            historyP3VersionArr[minorVersionIndex] = 0;
            historyP3VersionArr[patchVersionIndex] = 0;
            if (historyP2dependenciesArr[majorVersionIndex].includes('^') || historyP2dependenciesArr[majorVersionIndex].includes('~')) {
                historyP2dependenciesArr[majorVersionIndex] = historyP[1].dependencies[updateLibrary][0] + (Number(historyP[1].dependencies[updateLibrary][1]) + 1);
                historyP3dependenciesArr[majorVersionIndex] = historyP[2].dependencies[updateLibrary][0] + (Number(historyP[2].dependencies[updateLibrary][1]) + 1);
            } else {
                historyP2dependenciesArr[majorVersionIndex] = Number(historyP2dependenciesArr[majorVersionIndex]) + 1;
                historyP3dependenciesArr[majorVersionIndex] = Number(historyP3dependenciesArr[majorVersionIndex]) + 1;
            }
            historyP2dependenciesArr[minorVersionIndex] = 0;
            historyP2dependenciesArr[patchVersionIndex] = 0;
            historyP3dependenciesArr[minorVersionIndex] = 0;
            historyP3dependenciesArr[patchVersionIndex] = 0
            break;
        case minorVersion:
            historyP1VersionArr[minorVersionIndex] = Number(historyP1VersionArr[minorVersionIndex]) + 1;
            historyP1VersionArr[patchVersionIndex] = 0;
            historyP2VersionArr[minorVersionIndex] = Number(historyP2VersionArr[minorVersionIndex]) + 1;
            historyP2VersionArr[patchVersionIndex] = 0;
            historyP3VersionArr[minorVersionIndex] = Number(historyP3VersionArr[minorVersionIndex]) + 1;
            historyP3VersionArr[patchVersionIndex] = 0;
            historyP2dependenciesArr[minorVersionIndex] = Number(historyP2dependenciesArr[minorVersionIndex]) + 1;
            historyP2dependenciesArr[patchVersionIndex] = 0;
            historyP3dependenciesArr[minorVersionIndex] = Number(historyP3dependenciesArr[minorVersionIndex]) + 1;
            historyP3dependenciesArr[patchVersionIndex] = 0
            break;
        case patchVersion:
            historyP1VersionArr[patchVersionIndex] = Number(historyP1VersionArr[patchVersionIndex]) + 1;
            historyP2VersionArr[patchVersionIndex] = Number(historyP2VersionArr[patchVersionIndex]) + 1;
            historyP3VersionArr[patchVersionIndex] = Number(historyP3VersionArr[patchVersionIndex]) + 1;
            historyP2dependenciesArr[patchVersionIndex] = Number(historyP2dependenciesArr[patchVersionIndex]) + 1;
            historyP3dependenciesArr[patchVersionIndex] = Number(historyP3dependenciesArr[patchVersionIndex]) + 1;
            break;
    }
    expect(currentP1.version).be.equal(historyP1VersionArr.join('.'));
    expect(currentP2.version).be.equal(historyP2VersionArr.join('.'));
    expect(currentP3.version).be.equal(historyP3VersionArr.join('.'));
    expect(currentP2.dependencies[updateLibrary]).be.equal(historyP2dependenciesArr.join('.'));
    expect(currentP3.dependencies[updateLibrary]).be.equal(historyP3dependenciesArr.join('.'));
}