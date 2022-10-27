const delay = 0; //ms -> higher the delay, the more the difference between memoized and non-memoized
const tries = 1000; // -> higher the tries, higher the memoization odds;
const randomizer = 10; // -> higher the randomizer, lesser the memoization odds;
const displayFirstAndLastResults = 10; // -> (tries / 2) to display every result;

if (
  delay < 0 ||
  tries <= 0 ||
  randomizer <= 0 ||
  displayFirstAndLastResults < 0
) {
  throw new Error("All values must be positive");
}

const processFn = (a: number, b: number): number => {
  return a * b * Math.pow(1234, 10);
};

// Simulates an Http request
const delayedFn = (ms: number, a: number, b: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(processFn(a, b));
    }, ms);
  });
};

const memo = (
  fn: (ms: number, a: number, b: number) => Promise<number>
): ((ms: number, a: number, b: number) => Promise<number>) => {
  const cache = new Map<string, number>();

  return async (ms: number, a: number, b: number): Promise<number> => {
    const key = `${a}-${b}`;

    if (cache.has(key)) {
      return cache.get(key) as number;
    }

    const result = await fn(ms, a, b);

    cache.set(key, result);
    return result;
  };
};

async function noMemoBenchmark() {
  let time = 0;
  for (let i = 0; i < tries; i++) {
    const t1 = performance.now();

    await delayedFn(
      delay,
      Math.round(Math.random() * randomizer),
      Math.round(Math.random() * randomizer)
    );
    const t2 = performance.now();
    time += t2 - t1;

    if (
      i < displayFirstAndLastResults ||
      i >= tries - displayFirstAndLastResults
    ) {
      console.log(`[NO-MEMO] Time for call ${i + 1}: ${t2 - t1} milliseconds.`);
    }
  }
  console.log(
    `\n--------------------------------------------------------\n [NO-MEMO] SUMMARY: \n--------------------------------------------------------\n`
  );
  console.table({
    "Average time": time / tries,
    "Total time": time,
  });
  console.log(`\n--------------------------------------------------------\n`);
}

async function memoBenchmark() {
  let time = 0;
  const memoizedFn = memo(delayedFn);
  for (let i = 0; i < tries; i++) {
    const t1 = performance.now();
    await memoizedFn(
      delay,
      Math.round(Math.random() * randomizer),
      Math.round(Math.random() * randomizer)
    );
    const t2 = performance.now();
    time += t2 - t1;

    if (
      i < displayFirstAndLastResults ||
      i >= tries - displayFirstAndLastResults
    ) {
      console.log(`[MEMO] Time for call ${i + 1}: ${t2 - t1} milliseconds.`);
    }
  }
  console.log(
    `\n--------------------------------------------------------\n [MEMO] SUMMARY: \n--------------------------------------------------------\n`
  );
  console.table({
    "Average time": time / tries,
    "Total time": time,
  });
  console.log(`\n--------------------------------------------------------\n`);
}

const benchmark = async () => {
  await noMemoBenchmark();
  await memoBenchmark();
};

benchmark();
