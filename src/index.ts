import { Api } from "./features/api";
import { MiddleWare } from "./types";

const Q = {
  createApi: (basePath: string, errorHandler: MiddleWare) => new Api(basePath, errorHandler),
};

export default Q;
