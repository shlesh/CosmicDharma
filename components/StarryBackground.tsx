import React from 'react';

export function StarryBackground() {
  return (
    <>
      <div className="star-layer layer1" aria-hidden="true"></div>
      <div className="star-layer layer2" aria-hidden="true"></div>
      <div className="star-layer layer3" aria-hidden="true"></div>
    </>
  );
}

export default StarryBackground;
