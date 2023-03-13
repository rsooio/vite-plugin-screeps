import { ScreepsAPI } from 'screeps-api';
import type { OutputBundle, OutputOptions } from 'rollup';

export interface ScreepsConfig {
  token?: string
  email?: string
  password?: string
  protocol: "http" | "https",
  hostname: string,
  port: number,
  path: string,
  branch: string | "auto"
}

export interface ScreepsOptions {
  configFile?: string
  config?: ScreepsConfig
  dryRun?: boolean
}

export interface BinaryModule {
  binary: string
}

export interface CodeList {
  [key: string]: string | BinaryModule
}

export function generateSourceMaps(bundle: OutputBundle) {
  // Iterate through bundle and test if type===chunk && map is defined
  let itemName: string;
  for (itemName in bundle) {
    let item = bundle[itemName];
    if (item.type === "chunk" && item.map) {

      // Tweak maps
      let tmp = item.map.toString;

      delete item.map.sourcesContent;

      item.map.toString = function () {
        return "module.exports = " + tmp.apply(this, arguments as unknown as []) + ";";

      }
    }
  }
}

export function writeSourceMaps(options: OutputOptions) {
  fs.renameSync(
    options.file + '.map',
    options.file + '.map.js'
  )
}