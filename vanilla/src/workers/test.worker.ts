import { WebOmniWorker } from '@anonaddy/omni-worker';

const obj = {
  someFn: (i: number) => { 
    // console.log("from webworker!"); 
    function fibonacci(n: number, memo: Record<number, number> = {}): number {
      if (n in memo) return memo[n];
      if (n <= 1) return n;

      memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
      return memo[n];
    }
    if (i % 1000 === 0) {
      console.log('running task', i, 'time', performance.now());
    }
    return fibonacci(Math.random() * 100);
  }
}

WebOmniWorker.expose(obj);