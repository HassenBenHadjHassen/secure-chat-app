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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const figlet_1 = __importDefault(require("figlet"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const startIOserver_1 = require("./startIOserver");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const startup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((resolve) => {
        (0, figlet_1.default)("Secure Chat App", (_, data) => {
            console.log("\x1b[1m\x1b[32m%s\x1b[0m", data);
            resolve(true);
        });
        const app = (0, express_1.default)();
        const server = http_1.default.createServer(app);
        const { PORT } = process.env;
        (0, startIOserver_1.startIOserver)(server);
        app.use((0, cors_1.default)({
            origin: "*",
        }));
        const port = PORT || 4531;
        server.listen(port, () => {
            console.log("Server is running on port " + port);
        });
    });
});
startup().catch((error) => {
    throw error;
});
