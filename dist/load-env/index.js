"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = void 0;
const fs_1 = __importDefault(require("fs"));
const loadEnv = (dotEnvPath) => {
    const envData = fs_1.default.readFileSync(dotEnvPath, "utf-8");
    envData.split("\n").forEach((envDataLine) => {
        const [key, value] = envDataLine.split("=");
        if (key && value) {
            process.env[key] = value;
        }
    });
};
exports.loadEnv = loadEnv;
//# sourceMappingURL=index.js.map