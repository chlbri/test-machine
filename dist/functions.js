"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvite = exports.getReferences = exports.getAllIndexes = exports.withoutSpawnRef = void 0;
const core_1 = require("@core_chlbri/core");
const nanoid_1 = require("nanoid");
const Actor_1 = require("xstate/lib/Actor");
function withoutSpawnRef(arg) {
    return arg
        ? Object.entries(arg)
            .filter(([_, value]) => !(0, core_1.isNullish)(value) && !(0, Actor_1.isSpawnedActor)(value))
            .reduce((prev, [key, value]) => {
            return Object.assign(prev, { [key]: value });
        }, {})
        : {};
}
exports.withoutSpawnRef = withoutSpawnRef;
function getAllIndexes(arr, val) {
    const indexes = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            indexes.push(i);
        }
    }
    return indexes;
}
exports.getAllIndexes = getAllIndexes;
function getReferences(args) {
    const names = new Set(args);
    const out = {};
    names.forEach(name => {
        const indexes = getAllIndexes(args, name);
        out[name] = indexes;
    });
    return out;
}
exports.getReferences = getReferences;
function createInvite(args) {
    const generator = (0, nanoid_1.customAlphabet)('1234567890ABCEDFGHIJK', 5);
    return args.map(arg => {
        arg = 'State ===> ' + arg;
        arg += ` ------- ( ${generator()} )`;
        return arg;
    });
}
exports.createInvite = createInvite;
