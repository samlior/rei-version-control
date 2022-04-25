import {expect} from "chai";
import * as fs from "fs";
import * as fsp from 'fs/promises';
import path from "path";
import {
    packagesDependenciesMp,
    needUpdateLibraryMp,
    majorVersion,
    minorVersion,
    patchVersion,
    updaeDependencies,
    updatePackageJson,
    needUpdateLibrary, myLibraryMp
} from "../changePackage";

const createPackageJsonPath = 'test' + path.sep + 'package.json';
const fileDir = 'test' + path.sep + 'packageJson-test';
const updateLibrary = '@rei-network/utils';
const packagePath = 'test' + path.sep + 'packageJson-test' + path.sep
const createData = fs.readFileSync(createPackageJsonPath)
const createP = JSON.parse(createData.toString());
describe('updatePackageJson', () => {
    it('update majorVersion', async () => {
        await createPackageJson();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(majorVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(majorVersion);
        clear()
        await deletePackageJson();
    });
    it('update minorVersion', async () => {
        await createPackageJson();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(minorVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(minorVersion);
        clear()
        await deletePackageJson();
    });
    it('update patchVersion', async () => {
        await createPackageJson();
        await updaeDependencies(fileDir);
        await needUpdateLibrary(packagesDependenciesMp.get(updateLibrary));
        needUpdateLibraryMp.set(updateLibrary, 1);
        await updatePackageJson(patchVersion, updateLibrary);
        //对比变更后的version和历史version
        await checkVersion(patchVersion);
        clear()
        await deletePackageJson();
    });
});

function clear() {
    packagesDependenciesMp.clear();
    needUpdateLibraryMp.clear();
    myLibraryMp.clear();
}

async function deletePackageJson() {
    for (let i = 0; i < createP.packages.length; i++) {
        const currentPath = packagePath + 'test' + i
        await fsp.unlink(currentPath + path.sep + 'package.json');
    }
}

async function createPackageJson() {
    for (let i = 0; i < createP.packages.length; i++) {
        const currentPath = packagePath + 'test' + i
        const p = createP.packages[i];
        const str = JSON.stringify(p, null, '\t');
        await fsp.writeFile(currentPath + path.sep + 'package.json', str);
    }
}

function checkVersion(updateVersionType: string) {
    for (let i = 1; i < createP.packages.length; i++) {
        const currentPath = packagePath + 'test' + i
        const currentData = fs.readFileSync(currentPath + path.sep + 'package.json')
        const currentP = JSON.parse(currentData.toString());
        switch (updateVersionType) {
            case majorVersion:
                expect(createP.test[majorVersion].result.version).be.equal(currentP.version);
                if (currentP.dependencies[updateLibrary] !== undefined) {
                    expect(createP.test[majorVersion].result.dependencies).be.equal(currentP.dependencies[updateLibrary]);
                }
                break;
            case minorVersion:
                expect(createP.test[minorVersion].result.version).be.equal(currentP.version);
                if (currentP.dependencies[updateLibrary] !== undefined) {
                    expect(createP.test[minorVersion].result.dependencies).be.equal(currentP.dependencies[updateLibrary]);
                }
                break;
            case patchVersion:
                expect(createP.test[patchVersion].result.version).be.equal(currentP.version);
                if (currentP.dependencies[updateLibrary] !== undefined) {
                    expect(createP.test[patchVersion].result.dependencies).be.equal(currentP.dependencies[updateLibrary]);
                }
                break;
        }
    }
}
