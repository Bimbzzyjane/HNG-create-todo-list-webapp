import { describe, expect, it } from 'vitest';
import { buildQueryString } from './queryString.js';

describe('buildQueryString', () => {
  it('returns an empty string when there is nothing to send', () => {
    expect(buildQueryString({})).toBe('');
    expect(buildQueryString({ search: '', status: '   ' })).toBe('');
  });

  it('skips values that match the defaults', () => {
    const query = buildQueryString(
      { search: '', status: 'all', priority: 'all', sort: 'created_at', order: 'desc' },
      { search: '', status: 'all', priority: 'all', sort: 'created_at', order: 'desc' },
    );

    expect(query).toBe('');
  });

  it('includes only the filters that were changed', () => {
    const defaults = { search: '', status: 'all', priority: 'all' };

    expect(buildQueryString({ search: 'api', status: 'pending', priority: 'high' }, defaults)).toBe(
      '?search=api&status=pending&priority=high',
    );
    expect(buildQueryString({ status: 'completed' }, defaults)).toBe('?status=completed');
  });

  it('encodes special characters', () => {
    expect(buildQueryString({ search: 'milk & bread' })).toBe('?search=milk+%26+bread');
  });
});
