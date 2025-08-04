# ts-semaphore

Simple semaphore implementation in Typescript

## Usage
```typescript
const sema = Semaphore(2);
const sema = new Semaphore(5);
const N = 31;

const promises = Array.from({ length: N }, async (_, i) => {
    await sema.down();
    console.log('Performing critical section', i);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sema.up();
});

await Promise.all(promises);
```

## Example Usage

```bash
bun install
bun run semaphore-usage.ts
```

## Tests
```bash
bun test
```
