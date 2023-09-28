"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { games, standings } = yield (0, src_1.crawl)({
        standings: 'https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/standings',
        games: 'https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/calendars?round=&team=24492&date='
    });
    console.log(games, standings);
}))();
