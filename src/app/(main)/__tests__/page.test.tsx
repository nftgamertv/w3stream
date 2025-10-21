/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import SplashPage from '../page';

// Mock the dynamic imports
jest.mock('@/components/ScrollingVIdeo', () => {
  return function MockScrollingVideo() {
    return <div data-testid="scrolling-video">Scrolling Video</div>;
  };
});

jest.mock('@/components/PerformanceModal', () => {
  return function MockPerformanceModal() {
    return <button data-testid="performance-modal">See Performance Stats</button>;
  };
});

jest.mock('@/components/KeystrokeListener', () => {
  return function MockKeystrokeListener() {
    return <div data-testid="keystroke-listener" />;
  };
});

jest.mock('@/components/CyclingText', () => {
  return {
    CyclingText: function MockCyclingText({ items }: { items: any[] }) {
      return <span data-testid="cycling-text">{items[0].content}</span>;
    },
  };
});

describe('SplashPage', () => {
  it('renders the main hero section', () => {
    render(<SplashPage />);

    expect(screen.getByText(/Be a part of the next-gen/i)).toBeInTheDocument();
    expect(screen.getByText(/revolution/i)).toBeInTheDocument();
  });

  it('renders the CyclingText component', () => {
    render(<SplashPage />);

    const cyclingText = screen.getByTestId('cycling-text');
    expect(cyclingText).toBeInTheDocument();
  });

  it('lazy loads ScrollingVideo component', async () => {
    render(<SplashPage />);

    await waitFor(() => {
      expect(screen.getByTestId('scrolling-video')).toBeInTheDocument();
    });
  });

  it('lazy loads PerformanceModal component', async () => {
    render(<SplashPage />);

    await waitFor(() => {
      expect(screen.getByTestId('performance-modal')).toBeInTheDocument();
    });
  });

  it('lazy loads KeystrokeListener component', async () => {
    render(<SplashPage />);

    await waitFor(() => {
      expect(screen.getByTestId('keystroke-listener')).toBeInTheDocument();
    });
  });

  it('renders animated background effects', () => {
    const { container } = render(<SplashPage />);

    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('renders floating decorative elements', () => {
    const { container } = render(<SplashPage />);

    const floatingElements = container.querySelectorAll('.rounded-full');
    expect(floatingElements.length).toBeGreaterThan(0);
  });

  it('maintains proper z-index layering', () => {
    const { container } = render(<SplashPage />);

    const mainContainer = container.querySelector('.fixed.inset-0');
    expect(mainContainer).toHaveClass('z-10');

    const bgEffect = container.querySelector('.overflow-hidden.pointer-events-none.-z-10');
    expect(bgEffect).toBeInTheDocument();
  });
});
