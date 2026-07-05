import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Screenshots from './Screenshots';
import { screenshots } from '@/lib/content/screenshots';

/**
 * Validates: Requirements 4.1
 */
describe('Screenshots (App Landing Page)', () => {
  it('renders at least 3 default screenshot items, each with its alt text and caption', () => {
    render(<Screenshots />);

    expect(screenshots.length).toBeGreaterThanOrEqual(3);

    for (const item of screenshots) {
      expect(screen.getByAltText(item.alt)).toBeInTheDocument();
      if (item.caption) {
        expect(screen.getByText(item.caption)).toBeInTheDocument();
      }
    }
  });
});
