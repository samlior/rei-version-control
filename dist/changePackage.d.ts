export declare let packagesDependenciesMp: Map<any, any>;
export declare let needUpdateLibraryMp: Map<any, any>;
export declare function needUpdateLibrary(librarys: []): void;
export declare function updatePackageJson(opts: {
    [option: string]: string;
}): void;
export declare function UpdaeDependencies(dirPath: string, opts: {
    [option: string]: string;
}): Promise<void>;
//# sourceMappingURL=changePackage.d.ts.map