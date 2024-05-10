import React, { useState, useRef } from 'react';

const DishInputComponent = ({ onSave, isPastDate }) => {
  const [dishName, setDishName] = useState('');
  const [calories, setCalories] = useState(0);
  const [isHealthy, setIsHealthy] = useState(false);
  const [isSugarFree, setIsSugarFree] = useState(false);
  const dishNameInputRef = useRef(null); // Ref for the Dish Name input

  const handleInputChange = (setterFunction) => (e) => {
    setterFunction(e.target.value);
  };

  const handleCheckboxChange = (setterFunction) => (e) => {
    setterFunction(e.target.checked);
  };

  const buttonStyles = {
    gridColumn: 'span 10', // Adjusted gridColumn to match the new 6 column grid
    backgroundColor: '#21B211',
    color: 'white',
    borderRadius: '8px',
    padding: '10px 20px',
    margin: '20px auto',
    alignSelf: 'center',
    padding: '.7rem 3rem',
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    onSave({
      dishName,
      calories,
      isHealthy,
      isSugarFree,
    });
    // Reset state after saving
    setDishName('');
    setCalories(0);
    setIsHealthy(false);
    setIsSugarFree(false);
    // Focus on Dish Name input after saving
    dishNameInputRef.current.focus();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', margin: '4rem 0 1rem', gap: '0.8em' }}>
      <input
        type="text"
        placeholder="Dish Name"
        value={dishName}
        onChange={handleInputChange(setDishName)}
        style={{
          gridColumn: 'span 6',
          padding: '3px 8px',
          fontWeight: 'bold',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
        }}
        ref={dishNameInputRef} // Assign the ref
      />
      <input
        type="number"
        placeholder="Calories"
        value={calories}
        onChange={handleInputChange(setCalories)}
        style={{
          gridColumn: 'span 2',
          padding: '3px 8px',
          fontWeight: 'bold',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          width: '100%',
          textAlign: 'right',
        }}
      />
      <input
        type="checkbox"
        checked={isHealthy}
        onChange={handleCheckboxChange(setIsHealthy)}
        style={{
          gridColumn: 'span 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          textAlign: 'center',
          paddingTop: '6px',
        }}
      />
      <input
        type="checkbox"
        checked={isSugarFree}
        onChange={handleCheckboxChange(setIsSugarFree)}
        style={{
          gridColumn: 'span 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          textAlign: 'center',
          paddingTop: '6px',
        }}
      />
      {!isPastDate && (
        <button type="button" onClick={handleSaveClick} style={buttonStyles}>
          Save
        </button>
      )}
    </div>
  );
};

export default DishInputComponent;
