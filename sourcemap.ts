import { SourceMapConsumer, MappedPosition } from "source-map";

class ErrorMapper {
  private static _consumer?: SourceMapConsumer;

  public static get consumer() {
    if (this._consumer === undefined) {
      this._consumer = new SourceMapConsumer(require("source-map"));
    }

    return this._consumer;
  }

  // public static get test() {
  //   return this._consumer ?? ((this._consumer = new SourceMapConsumer(require("source-map"))) && this.consumer);
  // }

  public static cache: { [key: string]: string } = {};

  public static sourceMapStackTrace(error: Error | string): string {
    const stack = error instanceof Error ? (error.stack as string) : error;
    if (Object.prototype.hasOwnProperty.call(this.cache, stack)) {
      return this.cache[stack];
    }

    const [message, ...lines] = stack.split("\n    at ");
    const stacks: MappedPosition[] = [];
    for (let i = 0; ; i++) {
      const line = lines[i];
      const info = line.slice(line.indexOf('(') + 1, line.indexOf(')')).split(':');
      if (info[0] !== "loop") {
        if (i) stacks[i - 1].name = "loop"
        break;
      }
      const pos = this.consumer.originalPositionFor({
        line: parseInt(info[1], 10) - 1,
        column: parseInt(info[2], 10),
      })
      if (i) stacks[i - 1].name = pos.name;
      stacks.push(pos);
    }

    const outLines = stacks.map(v => `${v.name} (${v.source}:${v.line}:${v.column})`);
    const outStack = [message, ...outLines].join("\n    at ");

    // const outStack = stack.split("\n    at ").map((v, i) => {
    //   if (i === 0) return v;
    //   const info = v.slice(v.indexOf('(') + 1, v.indexOf(')')).split(':');
    //   const name = v.slice(0, v.indexOf('('));
    //   if (info[0] !== "loop") return;
    //   const pos = this.consumer.originalPositionFor({
    //     line: parseInt(info[1], 10) - 1,
    //     column: parseInt(info[2], 10),
    //   });
    //   const originalPosition = [pos.source, pos.line, pos.column].join(":");
    //   // console.log(v, pos.name, pos.source, pos.line, pos.column, parseInt(info[1], 10), parseInt(info[2], 10))
    //   return ["    at", pos.name ?? name, pos.name || name ? `(${originalPosition})` : originalPosition].join(" ");
    // }).filter(v => v).join("\n");

    // console.log(error)
    // const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
    // let match: RegExpExecArray | null;
    // let outStack = error.toString();

    // while ((match = re.exec(stack))) {
    //   if (match[2] !== "main") break;
    //   const pos = this.consumer.originalPositionFor({
    //     column: parseInt(match[4], 10),
    //     line: parseInt(match[3], 10)
    //   })

    //   if (pos.line == null) break;
    //   const name = pos.name ?? match[1];
    //   outStack += `<br> at ${name}${name ? " " : ""}(${pos.source}:${pos.line}:${pos.column})`
    // }

    this.cache[stack] = outStack;
    return outStack;
  }

  public static warpLoop(loop: () => void) {
    try {
      loop();
    } catch (e) {
      if (e instanceof Error) {
        console.log(`<span style="color:red">${"sim" in Game.rooms
          ? `Source map don't work in the simulator - displaying oringinal error<br>${e.stack}`
          : this.sourceMapStackTrace(e)
          }</span>`);
      } else {
        throw e;
      }
    }
  }
}

export const loop = ErrorMapper.warpLoop(require('loop').loop)

