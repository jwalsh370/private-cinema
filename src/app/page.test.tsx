import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';

// Mock API response
const mockResponse = {
  signedUrl: 'https://example.com/stream.m3u8',
  expiresAt: Date.now() + 3600000
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockResponse),
  })
);

describe('Streaming Page', () => {
  it('should load video successfully', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Load Video'));
    
    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(<Home />);
    await userEvent.click(screen.getByText('Load Video'));
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });
});

