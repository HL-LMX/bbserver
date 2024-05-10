import React from 'react';

const Dish = ({ dish }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
    <div style={{ gridColumn: 'span 3', color: 'black' }}>{dish.dish.dish_name}</div>
    <div style={{ color: 'black' }}>{dish.dish.dish_calories}</div>
    <div style={{ color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <input type="checkbox" disabled checked={dish.dish.light_healthy} style={{ transform: 'scale(1.5)' }} />
    </div>
    <div style={{ color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <input type="checkbox" disabled checked={dish.dish.sugar_free} style={{ transform: 'scale(1.5)' }} />
    </div>
  </div>
);

export default Dish;
