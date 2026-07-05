import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

/**
 * Validates: Requirements 12.9
 */
describe('Breadcrumbs', () => {
  const items: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Judul Artikel' },
  ];

  it('renders every breadcrumb item label', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Judul Artikel')).toBeInTheDocument();
  });

  it('renders every item except the last as a link with the correct href', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
  });

  it('does not render the last item as a link and marks it as the current page', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.queryByRole('link', { name: 'Judul Artikel' })).not.toBeInTheDocument();

    const current = screen.getByText('Judul Artikel');
    expect(current.tagName).not.toBe('A');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders nothing when items is an empty array (e.g. on the App Landing Page)', () => {
    const { container } = render(<Breadcrumbs items={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });
});
