import React, { useRef } from 'react';
import useBilliards from '../hooks/useBilliards'; // Adjust the import path as necessary

const BilliardsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedBall, changeBallColor } = useBilliards(canvasRef);

  return (
    <>
      <canvas style={{ border: '1px solid black', borderRadius: '8px' }} ref={canvasRef} width={800} height={600} />
      {selectedBall && (
        <div>
          <input type="color" onChange={(e) => changeBallColor(e.target.value)} />
        </div>
      )}
    </>
  );
};

export default BilliardsCanvas;