import '../setup';
import { cacheGet, cacheSet, cacheDel } from '../../../utils/cache';

describe('Cache Utilities — Unit Tests', () => {
  it('should store and retrieve a value', async () => {
    await cacheSet('test:key', { foo: 'bar' });
    const result = await cacheGet<{ foo: string }>('test:key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should return null for non-existent key', async () => {
    const result = await cacheGet('test:nonexistent');
    expect(result).toBeNull();
  });

  it('should delete a cached value', async () => {
    await cacheSet('test:delete-me', 'value');
    await cacheDel('test:delete-me');
    const result = await cacheGet('test:delete-me');
    expect(result).toBeNull();
  });

  it('should handle complex objects', async () => {
    const data = [
      { id: '1', title: 'Task A', status: 'pending' },
      { id: '2', title: 'Task B', status: 'completed' },
    ];
    await cacheSet('test:tasks', data);
    const result = await cacheGet<typeof data>('test:tasks');
    expect(result).toEqual(data);
  });

  it('should not throw when deleting non-existent key', async () => {
    await expect(cacheDel('test:phantom')).resolves.not.toThrow();
  });
});
