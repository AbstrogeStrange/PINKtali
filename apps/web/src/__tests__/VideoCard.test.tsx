import { render, screen, fireEvent } from '@testing-library/react';
import { VideoCard } from '../../components/video/VideoCard';

const mockVideo = {
  id: 'v1',
  title: 'Test Video',
  channelName: 'Test Channel',
  channelHandle: 'test',
  viewCount: 1000,
  publishedAt: new Date().toISOString(),
  duration: '10:00'
};

describe('VideoCard Component', () => {
  it('renders video title and channel name', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
  });

  it('navigates to watch page on click', () => {
    const { container } = render(<VideoCard video={mockVideo} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/watch/v1');
  });
});
