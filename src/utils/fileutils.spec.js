"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fileutils_1 = require("./fileutils");
var fs = require("fs");
describe('fileutils', function () {
    describe('sortApps', function () {
        it('should handle undefined', function () {
            expect(fileutils_1.addApp(undefined, { name: 'a' })).toEqual([{ name: 'a' }]);
        });
        it('should handle an empty array', function () {
            expect(fileutils_1.addApp([], { name: 'a' })).toEqual([{ name: 'a' }]);
        });
        it('should sort apps by name', function () {
            expect(fileutils_1.addApp([{ name: 'a' }, { name: 'b' }], { name: 'c' })).toEqual([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]);
        });
        it('should put workspaceRoot last', function () {
            expect(fileutils_1.addApp([{ name: 'a' }, { name: 'z' }], { name: '$workspaceRoot' })).toEqual([{ name: 'a' }, { name: 'z' }, { name: '$workspaceRoot' }]);
        });
        it('should prioritize apps with "main" defined', function () {
            expect(fileutils_1.addApp([{ name: 'c' }, { name: 'a' }, { name: 'a', main: 'a' }], {
                name: 'b',
                main: 'b'
            })).toEqual([
                { name: 'a', main: 'a' },
                { name: 'b', main: 'b' },
                { name: 'a' },
                { name: 'c' }
            ]);
        });
    });
    describe('createDirectory', function () {
        var fakeExistingDirectories;
        beforeEach(function () {
            fakeExistingDirectories = new Set();
            fakeExistingDirectories.add('/a');
            spyOn(fs, 'mkdirSync').and.callFake(function (path) {
                fakeExistingDirectories.add(path);
            });
            spyOn(fs, 'statSync').and.callFake(function (path) {
                return {
                    isDirectory: function () { return fakeExistingDirectories.has(path); }
                };
            });
        });
        it('should recursively create the directory', function () {
            fileutils_1.createDirectory('/a/b/c');
            var expectedSet = new Set(['/a', '/a/b', '/a/b/c']);
            expect(fakeExistingDirectories).toEqual(expectedSet);
        });
    });
});
