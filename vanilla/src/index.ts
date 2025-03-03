import { WebOmniWorker, WebOmniWorkerPool } from "@anonaddy/omni-worker";

const workerUrl = new URL('./workers/test.worker.ts', import.meta.url);
const worker = await WebOmniWorker.build<any>(workerUrl);

const pool = WebOmniWorkerPool.launch(worker)
const numOfPoolWorkers = pool.getNumOfWorkers();

const workerValue = await worker.use().someFn(120);
const poolValue = await pool.use().someFn(74);

console.log(
  'worker', workerValue,
  'defaultPool', poolValue,
  'numWorkers', numOfPoolWorkers
);

// Yield to main thread to keep UI responsive on for loop
const doYield = () => new Promise<void>(resolve => setTimeout(() => resolve()));

console.log('start creating pool');

const largePool = await WebOmniWorkerPool.buildAndLaunch<any>(workerUrl, {
  extension: '.js',
  numOfWorkers: 4
});

const largePoolWorkers = largePool.getNumOfWorkers();

console.log('created a pool with ' + largePoolWorkers + ' workers');
console.log('collecting promise functions');

// collect the promise functions
const promiseFns: Promise<number>[] = [];
for (let i = 100_000; i >= 0; i--) {
  const fn =  largePool.use().someFn(i);
  promiseFns.push(fn);
  if (i % 800 === 0) {
    await doYield();
  }
}
console.log('done collecting promise functions');

const start = performance.now();
const end = performance.now();

console.log('fn prep duration', end - start + ' ms');
const result = await Promise.all(promiseFns);

console.log('pool result', result);

await pool.destroy();
await largePool.destroy();
await worker.destroy();