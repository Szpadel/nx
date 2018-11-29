"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
describe('offsetFromRoot', function () {
    it('should work for normal paths', function () {
        var result = common_1.offsetFromRoot('apps/appname');
        expect(result).toBe('../../');
    });
    it('should work for paths with a trailing slash', function () {
        var result = common_1.offsetFromRoot('apps/appname/');
        expect(result).toBe('../../');
    });
    it('should work for deep paths', function () {
        var result = common_1.offsetFromRoot('apps/dirname/appname');
        expect(result).toBe('../../../');
    });
    it('should work for deep paths with a trailing slash', function () {
        var result = common_1.offsetFromRoot('apps/dirname/appname/');
        expect(result).toBe('../../../');
    });
});
