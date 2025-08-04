import { test, expect, describe } from "bun:test";
import Semaphore from "./semaphore";

describe("Semaphore", () => {
  test("should allow immediate access when capacity is available", async () => {
    const semaphore = new Semaphore(2);
    
    // Both down operations should complete immediately
    await semaphore.down();
    await semaphore.down();
    
    // Both operations should have completed without blocking
    expect(true).toBe(true); // If we reach here, both operations completed
  });

  test("should queue requests when capacity is exhausted", async () => {
    const semaphore = new Semaphore(1);
    
    // First down should succeed immediately
    await semaphore.down();
    
    // Second down should be queued and not complete immediately
    let secondDownCompleted = false;
    const secondDownPromise = semaphore.down().then(() => {
      secondDownCompleted = true;
    });
    
    // Give a small delay to ensure the second down hasn't completed yet
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(secondDownCompleted).toBe(false);
    
    // Release capacity
    semaphore.up();
    
    // Second down should now complete
    await secondDownPromise;
    expect(secondDownCompleted).toBe(true);
  });

  test("should wake up queued requests when capacity is released", async () => {
    const semaphore = new Semaphore(1);
    
    // Exhaust capacity
    await semaphore.down();
    
    // Queue multiple requests
    const completionOrder: number[] = [];
    const promises = [
      semaphore.down().then(() => completionOrder.push(1)),
      semaphore.down().then(() => completionOrder.push(2)),
      semaphore.down().then(() => completionOrder.push(3))
    ];
    
    // Give a small delay to ensure none have completed yet
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(completionOrder).toEqual([]);
    
    // Release capacity multiple times
    semaphore.up();
    semaphore.up();
    semaphore.up();
    
    // All promises should resolve
    await Promise.all(promises);
    expect(completionOrder).toEqual([1, 2, 3]);
  });

  test("should handle concurrent access correctly", async () => {
    const semaphore = new Semaphore(2);
    const results: number[] = [];
    
    // Start multiple concurrent operations
    const promises = Array.from({ length: 5 }, async (_, i) => {
      await semaphore.down();
      results.push(i);
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      semaphore.up();
    });
    
    await Promise.all(promises);
    
    // Should have 5 results
    expect(results.length).toBe(5);
    expect(results).toContain(0);
    expect(results).toContain(1);
    expect(results).toContain(2);
    expect(results).toContain(3);
    expect(results).toContain(4);
  });

  test("should maintain correct capacity after multiple operations", async () => {
    const semaphore = new Semaphore(3);
    
    // Take all capacity
    await semaphore.down();
    await semaphore.down();
    await semaphore.down();
    
    // Try to take more capacity - should block
    let extraDownCompleted = false;
    const extraDownPromise = semaphore.down().then(() => {
      extraDownCompleted = true;
    });
    
    // Give a small delay to ensure it hasn't completed
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(extraDownCompleted).toBe(false);
    
    // Release all capacity
    semaphore.up();
    semaphore.up();
    semaphore.up();
    
    // The extra down should now complete
    await extraDownPromise;
    expect(extraDownCompleted).toBe(true);
  });

  test("should handle edge case of zero capacity", async () => {
    const semaphore = new Semaphore(0);
    
    // Any down operation should be queued
    let downCompleted = false;
    const downPromise = semaphore.down().then(() => {
      downCompleted = true;
    });
    
    // Give a small delay to ensure it hasn't completed
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(downCompleted).toBe(false);
    
    // Release capacity
    semaphore.up();
    await downPromise;
    expect(downCompleted).toBe(true);
  });

  test("should handle multiple up calls when no one is waiting", async () => {
    const semaphore = new Semaphore(2);
    
    // Take some capacity
    await semaphore.down();
    
    // Release multiple times - should not cause issues
    semaphore.up();
    semaphore.up();
    semaphore.up();
    
    // Should be able to take capacity again
    await semaphore.down();
    await semaphore.down();
    
    // If we reach here, the operations completed successfully
    expect(true).toBe(true);
  });

  test("should handle rapid up/down operations", async () => {
    const semaphore = new Semaphore(1);
    
    // Rapid sequence of operations
    await semaphore.down();
    semaphore.up();
    await semaphore.down();
    semaphore.up();
    await semaphore.down();
    
    // If we reach here, all operations completed successfully
    expect(true).toBe(true);
  });

  test("should process queue in FIFO order", async () => {
    const semaphore = new Semaphore(1);
    
    // Exhaust capacity
    await semaphore.down();
    
    // Queue multiple requests
    const completionOrder: number[] = [];
    const promises = [
      semaphore.down().then(() => completionOrder.push(1)),
      semaphore.down().then(() => completionOrder.push(2)),
      semaphore.down().then(() => completionOrder.push(3))
    ];
    
    // Release capacity one by one
    semaphore.up();
    await new Promise(resolve => setTimeout(resolve, 10));
    semaphore.up();
    await new Promise(resolve => setTimeout(resolve, 10));
    semaphore.up();
    
    // All promises should resolve in order
    await Promise.all(promises);
    expect(completionOrder).toEqual([1, 2, 3]);
  });

  test("should handle stress test with many concurrent operations", async () => {
    const semaphore = new Semaphore(3);
    const concurrentCount = 10;
    const results: number[] = [];
    
    // Start many concurrent operations
    const promises = Array.from({ length: concurrentCount }, async (_, i) => {
      await semaphore.down();
      results.push(i);
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      semaphore.up();
    });
    
    await Promise.all(promises);
    
    // Should have all results
    expect(results.length).toBe(concurrentCount);
    for (let i = 0; i < concurrentCount; i++) {
      expect(results).toContain(i);
    }
  });
}); 