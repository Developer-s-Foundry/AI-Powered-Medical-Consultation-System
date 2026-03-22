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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = require("./config/logger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = require("./swagger/routes");
(() => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
    const logger = logger_1.Logger.getInstance();
    const port = process.env.PORT;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    (0, routes_1.RegisterRoutes)(app);
    // Swagger ui setup
    app.use("/api", swagger_ui_express_1.default.serve, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res.send(swagger_ui_express_1.default.generateHTML(require("./swagger/swagger.json")));
    }));
    try {
        yield database_1.default.initialize();
        console.log('Database connection established successfully.');
        app.listen(port, () => {
            logger.logToConsole();
            logger.info(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        logger.error('Error starting server:', error);
    }
}))();
