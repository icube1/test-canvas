
interface Ball {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number; // скорость по оси X
    vy: number; // скорость по оси Y
    isDragging: boolean; // Флаг, указывающий, что мяч находится в режиме перетаскивания
}

const generateRandomBalls = (count: number): Ball[] => {
    const balls: Ball[] = [];
    const minDistance = 40; // Minimum distance between ball centers to avoid overlapping

    const checkCollision = (ball1: Ball, ball2: Ball): boolean => {
        const dx = ball1.x - ball2.x;
        const dy = ball1.y - ball2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball1.radius + ball2.radius + minDistance;
    };

    const createNonCollidingBall = (): Ball => {
        const radius = 20;
        const x = Math.random() * (800 - radius * 2) + radius;
        const y = Math.random() * (600 - radius * 2) + radius;
        const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        const id = `ball_${balls.length}`;

        // Check for collisions with existing balls
        for (const existingBall of balls) {
            // @ts-expect-error: x, y, radius are all numbers
            if (checkCollision({ x, y, radius }, existingBall)) {
                return createNonCollidingBall();
            }
        }

        return { id, x, y, radius, color, vx: 0, vy: 0, isDragging: false };
    };

    for (let i = 0; i < count; i++) {
        balls.push(createNonCollidingBall());
    }

    return balls;
};

  const isMouseInBall = (mouseX: number, mouseY: number, ball: Ball): boolean => {
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    return Math.sqrt(dx * dx + dy * dy) <= ball.radius;
  };
export { generateRandomBalls, isMouseInBall };
export type { Ball };
