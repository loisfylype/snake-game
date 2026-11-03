import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('eats, pauses and restarts after a wall collision', () => {
  jest.useFakeTimers();
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  try {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Difícil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    act(() => jest.advanceTimersByTime(115 * 6));
    expect(screen.getByText('PONTOS').textContent).toBe('PONTOS 1');
    fireEvent.keyDown(window, { code: 'Space' });
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByRole('status')).toHaveTextContent('Pausado');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    act(() => jest.advanceTimersByTime(110 * 3));
    expect(screen.getByRole('status')).toHaveTextContent('Fim de jogo');
    fireEvent.click(screen.getByRole('button', { name: 'Jogar de novo' }));
    expect(screen.getByText('PONTOS').textContent).toBe('PONTOS 0');
    expect(screen.getByText('RECORDE').textContent).toBe('RECORDE 1');
  } finally {
    random.mockRestore();
    jest.useRealTimers();
  }
});

test('wraps through the right edge in normal mode', () => {
  jest.useFakeTimers();
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  try {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    act(() => jest.advanceTimersByTime(175 * 6));
    act(() => jest.advanceTimersByTime(170 * 4));
    expect(container.querySelectorAll('.board span')[200]).toHaveClass('head');
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
  } finally {
    random.mockRestore();
    jest.useRealTimers();
  }
});
