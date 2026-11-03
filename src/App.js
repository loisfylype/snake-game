import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const size = 20;
const initialSnake = [210, 209, 208];
const directions = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] };
const numberKeys = { '2': 'ArrowUp', '4': 'ArrowLeft', '6': 'ArrowRight', '8': 'ArrowDown' };
const labels = ['Cima', 'Esquerda', 'Baixo', 'Direita'];

const modes = { normal: 'Normal', hard: 'Difícil', arcade: 'Arcade' };

function newGame(mode = 'normal') {
  const walls = new Set();
  const opening = () => {
    const width = 5 + Math.floor(Math.random() * 8);
    return { width, start: 1 + Math.floor(Math.random() * (size - 1 - width)) };
  };
  const horizontalPortal = opening();
  const verticalPortal = opening();

  if (mode !== 'normal') {
    for (let i = 0; i < size; i++) {
      if (mode === 'hard' || i < verticalPortal.start || i >= verticalPortal.start + verticalPortal.width) {
        walls.add(i);
        walls.add((size - 1) * size + i);
      }
      if (mode === 'hard' || i < horizontalPortal.start || i >= horizontalPortal.start + horizontalPortal.width) {
        walls.add(i * size);
        walls.add(i * size + size - 1);
      }
    }
  }

  if (mode === 'arcade') {
    const count = 2 + Math.floor(Math.random() * 6);
    const obstacles = new Set();
    for (let i = 0; i < count; i++) {
      const length = 1 + Math.floor(Math.random() * 7);
      const vertical = Math.random() < 0.5;
      const candidates = [];
      for (let row = 2; row <= size - 3; row++) {
        for (let column = 2; column <= size - 3; column++) {
          if ((vertical ? row : column) + length - 1 > size - 3) continue;
          const cells = Array.from({ length }, (_, block) =>
            row * size + column + block * (vertical ? size : 1));
          if (cells.some(cell => cell >= 208 && cell <= 216)) continue;
          if (cells.some(cell => [-size - 1, -size, -size + 1, -1, 0, 1, size - 1, size, size + 1]
            .some(offset => obstacles.has(cell + offset)))) continue;
          candidates.push(cells);
        }
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      chosen?.forEach(cell => obstacles.add(cell));
    }
    obstacles.forEach(cell => walls.add(cell));
  }

  return { mode, walls, horizontalPortal, verticalPortal, elapsed: 0, snake: initialSnake, food: 216, score: 0, phase: 'ready', direction: [1, 0] };
}

function narrowPassages(game, elapsed) {
  const steps = Math.floor(elapsed / 15000);
  const walls = new Set(game.walls);
  for (const [portal, horizontal] of [[game.horizontalPortal, true], [game.verticalPortal, false]]) {
    const width = Math.max(1, portal.width - steps * 2);
    const start = portal.start + Math.floor((portal.width - width) / 2);
    for (let i = portal.start; i < portal.start + portal.width; i++) {
      if (i >= start && i < start + width) continue;
      const pair = horizontal ? [i * size, i * size + size - 1] : [i, (size - 1) * size + i];
      if (pair.every(cell => cell !== game.food && !game.snake.includes(cell))) {
        pair.forEach(cell => walls.add(cell));
      }
    }
  }
  return walls;
}

function advance(game, direction) {
  const [head] = game.snake;
  const x = head % size + direction[0];
  const y = Math.floor(head / size) + direction[1];
  const next = ((y + size) % size) * size + (x + size) % size;
  const eats = next === game.food;
  const body = eats ? game.snake : game.snake.slice(0, -1);
  if (game.walls.has(next) || body.includes(next)) {
    return { ...game, phase: 'lost' };
  }
  const snake = [next, ...body];
  if (!eats) return { ...game, snake, direction };
  const occupied = new Set(snake);
  const free = Array.from({ length: size * size }, (_, i) => i).filter(i => !occupied.has(i) && !game.walls.has(i));
  return {
    ...game, snake, direction, score: game.score + 1,
    food: free[Math.floor(Math.random() * free.length)],
    phase: free.length ? 'playing' : 'won',
  };
}

export default function App() {
  const [game, setGame] = useState(() => newGame());
  const [keypadOpen, setKeypadOpen] = useState(false);
  const current = useRef(game);
  const pending = useRef(null);
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem('snake-best')) || 0; }
    catch { return 0; }
  });

  function update(next) {
    current.current = next;
    setGame(next);
  }

  const toggle = useCallback(() => {
    const active = current.current;
    pending.current = null;
    if (active.phase === 'playing' || active.phase === 'paused') {
      update({ ...active, phase: active.phase === 'playing' ? 'paused' : 'playing' });
    } else {
      update({ ...(active.phase === 'ready' ? active : newGame(active.mode)), phase: 'playing' });
    }
  }, []);

  function turn(key) {
    const [dx, dy] = directions[key];
    const { phase, direction } = current.current;
    if (phase === 'playing' && !pending.current && dx * direction[0] + dy * direction[1] === 0) {
      pending.current = directions[key];
    }
  }

  useEffect(() => {
    function onKey(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = numberKeys[event.key] || event.key;
      if (Object.prototype.hasOwnProperty.call(directions, key)) {
        event.preventDefault();
        turn(key);
      } else if (event.code === 'Space' && !event.target.closest?.('button')) {
        event.preventDefault();
        if (!event.repeat) toggle();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  useEffect(() => {
    if (game.phase !== 'playing') return;
    const delay = Math.max(70, ({ normal: 175, hard: 115, arcade: 145 })[game.mode] - game.score * 5);
    const timer = window.setInterval(() => {
      const active = current.current;
      if (active.phase !== 'playing') return;
      const direction = pending.current || active.direction;
      pending.current = null;
      const next = advance(active, direction);
      if (active.mode === 'arcade' && next.phase === 'playing') {
        next.elapsed += delay;
        if (next.elapsed >= 15000) next.walls = narrowPassages(next, next.elapsed);
      }
      update(next);
    }, delay);
    return () => window.clearInterval(timer);
  }, [game.mode, game.phase, game.score]);

  useEffect(() => {
    if (game.score <= best) return;
    setBest(game.score);
    try { localStorage.setItem('snake-best', String(game.score)); }
    catch { /* Storage may be disabled. */ }
  }, [game.score, best]);

  const messages = { ready: 'Pronto para jogar?', paused: 'Pausado', lost: 'Fim de jogo', won: 'Você venceu!' };
  const actions = { ready: 'Jogar', playing: 'Pausar', paused: 'Continuar', lost: 'Jogar de novo', won: 'Jogar de novo' };
  const occupied = new Set(game.snake);

  return (
    <main className="handset">
      <header><span>ARCADE DE BOLSO</span><h1>Snake</h1></header>
      <div className="mode-picker" role="group" aria-label="Modo de jogo">
        {Object.entries(modes).map(([mode, label]) => (
          <button key={mode} aria-pressed={game.mode === mode}
            disabled={game.phase === 'playing' || game.phase === 'paused'}
            onClick={() => update(newGame(mode))}>{label}</button>
        ))}
      </div>
      <section className="screen" aria-label="Visor do jogo">
        <div className="scores"><span>PONTOS <b>{game.score}</b></span><span>RECORDE <b>{best}</b></span></div>
        <div className="playfield">
          <div className="board" aria-hidden="true">
            {Array.from({ length: size * size }, (_, i) => (
              <span key={i} className={i === game.snake[0] ? 'head' : occupied.has(i) ? 'body' : i === game.food ? 'food' : game.walls.has(i) ? 'wall' : ''} />
            ))}
          </div>
          <div className="status" role="status">
            {messages[game.phase] && <strong>{messages[game.phase]}</strong>}
          </div>
        </div>
      </section>
      <aside className="control-panel" aria-label="Controles do jogo">
        <div className="controls">
          <button className="action" onClick={toggle}>{actions[game.phase]}</button>
          <div className="direction-pad" role="group" aria-label="Direção">
            {Object.keys(directions).map((key, i) => (
              <button key={key} aria-label={labels[i]} disabled={game.phase !== 'playing'} onClick={() => turn(key)}>
                {['↑', '←', '↓', '→'][i]}
              </button>
            ))}
          </div>
        </div>
        <button className="keypad-toggle" aria-expanded={keypadOpen} aria-controls="numeric-pad"
          onClick={() => setKeypadOpen(open => !open)}>
          {keypadOpen ? 'Fechar teclado numérico' : 'Abrir teclado numérico'}
        </button>
        <div className="numeric-pad" id="numeric-pad" role="group" aria-label="Teclado numérico" hidden={!keypadOpen}>
          {Array.from({ length: 9 }, (_, i) => {
            const number = i + 1;
            const key = numberKeys[number];
            const arrow = Object.keys(directions).indexOf(key);
            return key ? (
              <button key={number} aria-label={number + ' ' + labels[arrow]}
                disabled={game.phase !== 'playing'} onClick={() => turn(key)}>
                {number} {['↑', '←', '↓', '→'][arrow]}
              </button>
            ) : <span key={number} aria-hidden="true">{number}</span>;
          })}
        </div>
        <p>Setas ou 2, 4, 6, 8 para virar<br />Espaço para jogar ou pausar</p>
      </aside>
    </main>
  );
}
