import axios, { Axios, AxiosInstance } from 'axios';
import { homedir } from 'os';

export interface APIConfig {
  token: string
  hostname?: string
  port?: number
  path?: string
  protocol?: "http" | "https"
}

export interface Code {
  branch: string
  modules: { [branch: string]: string }
}

const DEFAULT_CONFIG: Omit<APIConfig, 'token'> = {
  hostname: "screeps.com",
  port: 443,
  protocol: "https",
  path: "api"
}

export interface CodeData {
  branch: string
  modules: { [name: string]: string }
}

abstract class BaseAPI {
  protected service: AxiosInstance;

  constructor(config: APIConfig) {
    const { token, hostname, port, protocol, path } = Object.assign(config, DEFAULT_CONFIG);
    this.service = axios.create({
      baseURL: `${protocol}://${hostname}:${port}/${path}`,
      headers: { "X-Token": token }
    })
  }
}

export class ScreepsAPI extends BaseAPI {
  constructor(config: APIConfig) {
    super(config)
    this.user = new UserAPI(config)
  }

  public user: UserAPI;
}

export class UserAPI extends BaseAPI {
  constructor(config: APIConfig) {
    super(config)
    this.code = new CodeAPI(config)
  }

  public info() {
    return this.service.get("/auth/me");
  }

  public code: CodeAPI;
}

export class CodeAPI extends BaseAPI {
  public upload(branch: string, modules: CodeData['modules']) {
    return this.service.post("/user/code", { branch, modules });
  }
}
