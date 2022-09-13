import { SmsSender } from './SmsSender';
import { Ready } from './Ready';
import { EventSourceProvider } from 'react-sse-hooks';
import ReconnectingEventSource from "reconnecting-eventsource";

class PreconfiguredReconnectingEventSource extends ReconnectingEventSource {
  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    super(url, {
      ...eventSourceInitDict,
      max_retry_time: 30000
    });
  }
};

// @ts-ignore
const consoleCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.consoleToFlutter : window.consoleToFlutter;

const FlutterSupport = () => {

  if (!consoleCommunicator) {
    return (<></>);
  }

  window.console = new FlutterConsole();
  
  console.log("Welcome Flutter");
  
  return (
    <>{/*
// @ts-ignore */}
      <EventSourceProvider eventSource={PreconfiguredReconnectingEventSource}>
        <SmsSender />
      </EventSourceProvider>
      <Ready />
    </>);
 
}

export { FlutterSupport };

class FlutterConsole implements Console {

    indent = '';
    
    profileEnd(label?: string): void {
        throw new Error('console.profileEnd not supported');
    }
    
    profile(label?: string): void {
        throw new Error('console.profile not supported');
    }
    
    Console: console.ConsoleConstructor;

    constructor() {
      this.count = this.count.bind(this);
      this.countReset = this.countReset.bind(this);
      this.debug = this.debug.bind(this);
      this.dir = this.dir.bind(this);
      this.dirxml = this.dirxml.bind(this);
      this.error = this.error.bind(this);
      this.group = this.group.bind(this);
      this.groupCollapsed = this.groupCollapsed.bind(this);
      this.groupEnd = this.groupEnd.bind(this);
      this.info = this.info.bind(this);
      this.log = this.log.bind(this);
      this.table = this.table.bind(this);
      this.time = this.time.bind(this);
      this.timeEnd = this.timeEnd.bind(this);
      this.timeLog = this.timeLog.bind(this);
      this.timeStamp = this.timeStamp.bind(this);
      this.trace = this.trace.bind(this);
      this.warn = this.warn.bind(this);
    } 
       
    assert(condition?: boolean, ...data: any[]): void {
      throw new Error('console.assert not supported');
    }
    
    clear(): void {
      
    }
    
    counts: number[] = [];
    
    count(label?: string): void {
      let c: number;
      let l: string;
      if (label) {
        c = ++this.counts[label];
        l = label;
      } else {
        l = 'default';
        c = ++this.counts[l];
      }
      this.l('INFO', `${l}: ${c}`);
    }
    
    countReset(label?: string): void {
      let l: string;
      if (label) {
        l = label;
        this.counts[label]=0;
      } else {
        l = 'default';
        this.counts[l]=0;
      }
      this.l('INFO', `${l}: 0`);
    }
    
    debug(...data: any[]): void {
      this.l('DEBUG', ...data);
    }
    
    dir(item?: any, options?: any): void {
      throw new Error('console.dir not supported');
    }
    
    dirxml(...data: any[]): void {
      throw new Error('console.dirxml not supported');
    }
    
    error(...data: any[]): void {
      this.l('ERROR', ...data);
    }
    
    group(...data: any[]): void {
      this.l('INFO', data);
      this.indent += '  ';
    }
    
    groupCollapsed(...data: any[]): void {
      this.l('INFO', data);
      this.indent += '  ';
    }
    
    groupEnd(): void {
      if (this.indent.length > 0) {
        this.indent = this.indent.substring(2);
      }
    }
    
    info(...data: any[]): void {
      this.l('INFO', ...data);
    }
    
    log(...data: any[]): void {
      this.l('INFO', ...data);
    }
    
    table(tabularData?: any, properties?: string[]): void {
      throw new Error('console.table not supported');
    }
    
    timers: Date[] = [];
    
    time(label?: string): void {
      let l: string;
      if (label) {
        l = label;
      } else {
        l = 'default';
      }
      this.timers[l] = new Date();
    }
    
    timeEnd(label?: string): void {
      let l: string;
      if (label) {
        l = label;
      } else {
        l = 'default';
      }
      const t = this.timers[l];
      if (t) {
        const diff = (new Date()).getTime() - t.getTime();
        this.l('INFO', `${l}: ${diff}ms - timer ended`);
        this.timers[l] = undefined;
      }
    }
    
    timeLog(label?: string, ...data: any[]): void {
      let l: string;
      if (label) {
        l = label;
      } else {
        l = 'default';
      }
      const t = this.timers[l];
      if (t) {
        const diff = (new Date()).getTime() - t.getTime();
        this.l('INFO', `${l}: ${diff}ms`, ...data);
      }
    }
    
    timeStamp(label?: string): void {
      throw new Error('console.timeStamp not supported');
    }
    
    trace(...data: any[]): void {
      this.l('TRACE', ...data);
    }
    
    warn(...data: any[]): void {
      this.l('WARN', ...data);
    }
    
    l(level: string, ...data: any[]) {
      const d = data
          .map(d => d === undefined ? 'undefined' : d === null ? 'null' : d.toString())
          .join('\n');
      consoleCommunicator.postMessage(
        JSON.stringify({
            "type": "Console",
            level,
            message: `${this.indent}${d}`
          }));
    }
    
};
