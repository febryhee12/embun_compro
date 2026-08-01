import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteHeader } from './SiteHeader';

const navigationMock = vi.hoisted(() => ({
  params: { lang: 'id' },
  pathname: '/id',
}));

vi.mock('next/navigation', () => ({
  useParams: () => navigationMock.params,
  usePathname: () => navigationMock.pathname,
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    systemTheme: 'light',
  }),
}));

describe('SiteHeader contact CTA', () => {
  beforeEach(() => {
    navigationMock.params = { lang: 'id' };
    navigationMock.pathname = '/id';
    document.body.innerHTML = '';
    window.history.pushState(null, '', '/id');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('points to the trailing-slash contact URL from another page', () => {
    render(<SiteHeader />);

    const contactLink = screen.getByRole('link', { name: 'Hubungi Kami' });

    expect(contactLink).toHaveAttribute('href', '/id/mitra/#contact');
  });

  it('smooth-scrolls to the contact form when already on the partner page', () => {
    navigationMock.pathname = '/id/mitra';
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const pushState = vi.spyOn(window.history, 'pushState');

    render(
      <>
        <SiteHeader />
        <div id="contact">Contact form</div>
      </>,
    );

    const contactLink = screen.getByRole('link', { name: 'Hubungi Kami' });
    fireEvent.click(contactLink);

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
    expect(pushState).toHaveBeenCalledWith(null, '', '/id/mitra/#contact');
  });

  it('scrolls to the contact form when the partner page loads with the contact hash', () => {
    navigationMock.pathname = '/id/mitra';
    window.history.pushState(null, '', '/id/mitra/#contact');
    vi.useFakeTimers();
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);

    render(
      <>
        <SiteHeader />
        <div id="contact">Contact form</div>
      </>,
    );

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
  });
});
