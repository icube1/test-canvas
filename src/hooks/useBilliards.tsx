import { useEffect, useRef, useState } from 'react';
import { Ball, generateRandomBalls, isMouseInBall } from '../utils/ballUtils'; // Assuming these utilities are defined elsewhere

interface DragStart {
  x: number;
  y: number;
}

const useBilliards = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [balls, setBalls] = useState<Ball[]>(generateRandomBalls(25));
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [dragStart, setDragStart] = useState<DragStart | null>(null);
  const ballsRef = useRef<Ball[]>(balls);

  useEffect(() => {
    ballsRef.current = balls;
  }, [balls]);


useEffect(() => {
  const canvas = canvasRef.current;
  const context = canvas?.getContext('2d');
  if (!context) return;

  const handleMouseDown = (event: MouseEvent) => {
    const rect = canvas!.getBoundingClientRect();
    // const mouseX = event.clientX - rect.left;
    // const mouseY = event.clientY - rect.top;

    const mouseX = event.clientX - rect.x;
    const mouseY = event.clientY - rect.y;

    const clickedBall = balls.find(ball => {
        return isMouseInBall(mouseX, mouseY, ball);
    });
    setSelectedBall(clickedBall ? { ...clickedBall, isDragging: true } : null);
    // Получение стартовой позиции перетягивания
    setDragStart({x: mouseX, y: mouseY});
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!selectedBall || !dragStart) return;
    const rect = canvas!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;

    const updatedBall = { ...selectedBall, vx: dx * 0.1, vy: dy * 0.1, isDragging: false };
    const updatedBalls = balls.map(ball => ball.id === selectedBall.id ? updatedBall : ball);
    setBalls(updatedBalls);

    // setSelectedBall(null);
    setDragStart(null);
    };

  canvas!.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    canvas!.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [balls, selectedBall, dragStart, canvasRef]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas?.getContext('2d');
    if (!context) return;

    const checkBallCollisions = () => {
        const balls = ballsRef.current;
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];
            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ball1.radius + ball2.radius;
  
            if (distance < minDistance) {
              // Calculate collision response
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);
              const damping = 0.1;
              const impulseLoss = 0.9;
  
              // Position ball1 on (0, 0)
              const pos0 = { x: 0, y: 0 };
  
              // Position ball2 relative to ball1
              const pos1 = rotate(dx, dy, sin, cos, true);
  
              // Rotate ball1's velocity
              const vel0 = rotate(ball1.vx, ball1.vy, sin, cos, true);
  
              // Rotate ball2's velocity
              const vel1 = rotate(ball2.vx, ball2.vy, sin, cos, true);
  
              // Collision reaction
              const vxTotal = vel0.x - vel1.x;
              vel0.x = ((ball1.radius - ball2.radius) * vel0.x + 2 * ball2.radius * vel1.x) / (ball1.radius + ball2.radius);
              vel1.x = vxTotal + vel0.x;

                // Apply damping
              vel0.x *= damping;
              vel1.x *= damping;
    
              // Apply impulse loss
              vel0.x -= impulseLoss * vel1.x;
              vel1.x -= impulseLoss * vel0.x;
  
              // Udate positions to avoid overlap
              const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
              const overlap = (ball1.radius + ball2.radius) - Math.abs(pos0.x - pos1.x);
              pos0.x += vel0.x / absV * overlap;
              pos1.x += vel1.x / absV * overlap;
  
              // Rotate positions back
              const pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
              const pos1F = rotate(pos1.x, pos1.y, sin, cos, false);
  
              // Adjust positions to screen
              ball2.x = ball1.x + pos1F.x;
              ball2.y = ball1.y + pos1F.y;
              ball1.x = ball1.x + pos0F.x;
              ball1.y = ball1.y + pos0F.y;
  
              // Rotate velocities back
              const vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
              const vel1F = rotate(vel1.x, vel1.y, sin, cos, false);
              ball1.vx = vel0F.x;
              ball1.vy = vel0F.y;
              ball2.vx = vel1F.x;
              ball2.vy = vel1F.y;
            }
          }
        }
      };
  
      const rotate = (x: number, y: number, sin: number, cos: number, reverse: boolean) => {
        return {
          x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
          y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
        };
      };

      const updateBallPositions = () => {
        const newBalls = ballsRef.current.map(ball => {
          let { x, y, vx, vy, radius } = ball;
          
          if (ball.isDragging) {
            x = dragStart!.x;
            y = dragStart!.y;
          } else {
            x += vx;
            y += vy;
            
            // Check collision with the right and left borders
            if (x + radius > canvasRef.current!.width) {
              x = canvasRef.current!.width - radius; // Reposition to avoid overlap
              vx *= -1; // Reverse velocity
            } else if (x - radius < 0) {
              x = radius; // Reposition to avoid overlap
              vx *= -1; // Reverse velocity
            }
      
            // Check collision with the bottom and top borders
            if (y + radius > canvasRef.current!.height) {
              y = canvasRef.current!.height - radius; // Reposition to avoid overlap
              vy *= -1; // Reverse velocity
            } else if (y - radius < 0) {
              y = radius; // Reposition to avoid overlap
              vy *= -1; // Reverse velocity
            }
          }
          
          return { ...ball, x, y, vx, vy };
        });
        
        setBalls(newBalls);
        ballsRef.current = newBalls;
      };
      

    const render = () => {
      // Очистка холста
      context.clearRect(0, 0, canvas!.width, canvas!.height);

      // Отрисовка шаров
      ballsRef.current.forEach((ball) => { // Use balls from ref
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fillStyle = ball.color;
        context.fill();
      });

      // Проверка столкновений между шарами и обновление позиций
      checkBallCollisions();
      updateBallPositions();

      // Запрос на следующий кадр анимации
      requestAnimationFrame(render);
    };

    render();
  }, [canvasRef, dragStart]);

  const changeBallColor = (color: string) => {
    if (selectedBall) {
      const updatedBalls = balls.map(ball =>
        ball.id === selectedBall.id ? { ...ball, color } : ball
      );
      setBalls(updatedBalls);
    }
  };

  return { balls, selectedBall, changeBallColor, canvasRef };
};

export default useBilliards;