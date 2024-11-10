"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDistPath = exports.resolveClientPath = void 0;
var path_1 = require("path");
/**
 * resolve client file path
 * @param pathSegments relative path of file in client
 * @returns absolute path of file
 */
var resolveClientPath = function () {
    var pathSegments = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pathSegments[_i] = arguments[_i];
    }
    return path_1.resolve.apply(void 0, __spreadArray([__dirname, '..', '..', 'client'], pathSegments, false));
};
exports.resolveClientPath = resolveClientPath;
/**
 * resolve dist file path
 * @param pathSegments relative path of file in dist
 * @returns absolute path of file
 */
var resolveDistPath = function () {
    var pathSegments = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pathSegments[_i] = arguments[_i];
    }
    return path_1.resolve.apply(void 0, __spreadArray([__dirname, '..', '..', 'dist'], pathSegments, false));
};
exports.resolveDistPath = resolveDistPath;
