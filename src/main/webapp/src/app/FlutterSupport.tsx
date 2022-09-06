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

const original = window.console;

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const FlutterSupport = () => {

  if (!nativeCommunicator) {
    return (<></>);
  }

  window.console = new FlutterConsole();
  
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
      original.log(`!!${this.indent}${l}: ${c}`);
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
      original.log(`!!${l}: 0`);
    }
    
    debug(...data: any[]): void {
      // @ts-ignore
      original.log(`!!${this.indent}DEBUG ${data}`);
    }
    
    dir(item?: any, options?: any): void {
      throw new Error('console.dir not supported');
    }
    
    dirxml(...data: any[]): void {
      throw new Error('console.dirxml not supported');
    }
    
    error(...data: any[]): void {
      original.error(`!!${this.indent}ERROR ${data}`);
    }
    
    group(...data: any[]): void {
      original.error(`!!${this.indent}${data}`);
      this.indent += '  ';
    }
    
    groupCollapsed(...data: any[]): void {
      original.error(`!!${this.indent}${data}`);
      this.indent += '  ';
    }
    
    groupEnd(): void {
      if (this.indent.length > 0) {
        this.indent = this.indent.substring(2);
      }
    }
    
    info(...data: any[]): void {
      original.log(`!!${this.indent}INFO ${data}`);
    }
    
    log(...data: any[]): void {
      this.info(data);
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
        original.log('!!${this.indent}${l}: ${diff}ms - timer ended');
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
        original.log('!!${this.indent}${l}: ${diff}ms ${data}');
      }
    }
    
    timeStamp(label?: string): void {
      throw new Error('console.timeStamp not supported');
    }
    
    trace(...data: any[]): void {
      original.log(`!!${this.indent}TRACE ${data}`);
    }
    
    warn(...data: any[]): void {
      const d = data
          .map(d => d === undefined ? 'undefined' : d === null ? 'null' : d.toString())
          .join('\n');
      original.log(`!!${this.indent}WARN ${d}`);
    }
    
};
