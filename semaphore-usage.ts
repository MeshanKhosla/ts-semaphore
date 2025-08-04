import Semaphore from "./semaphore";

const sema = new Semaphore(5);
const N = 31;

const promises = Array.from({ length: N }, async (_, i) => {
    await sema.down();
    console.log('Performing critical section', i);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sema.up();
});

await Promise.all(promises);
