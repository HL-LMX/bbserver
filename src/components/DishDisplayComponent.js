// DishDisplayComponent.js

import React from 'react';



const DishDisplayComponent = ({ dish, onDishNameChange, onCaloriesChange, onCheckboxChange, onDelete, isPastDate }) => {

	const handleDelete = () => {
		// Call the onDelete function passed from the parent component
		onDelete(dish.dish.dish_id, dish.date_has_dish_id);
	};

  return (

    <div
		key={dish.dish.dish_id}
		style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(11, 1fr)', // Increased from 10 to accommodate the trashcan button
			marginBottom: '1em',
			gap: '0.8em',
		}}
    >

		{/* Conditionally render trashcan button based on isPastDate */}
		{/* Trashcan button */}
		{!isPastDate && (
			<button onClick={handleDelete} style={{ gridColumn: 'span 1', background: 'none', border: 'none', cursor: 'pointer' }}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-trash3-fill" viewBox="0 0 16 16">
				<path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
				</svg>
			</button>
		)}

		{/* Dish name input */}
		<input
		type="text"
		value={dish.dish.dish_name}
		onChange={(e) => onDishNameChange(dish.dish.dish_id, e.target.value)}
		style={{
			gridColumn: 'span 6',
			padding: '3px 8px',
			fontWeight: 'bold',
			fontSize: '14px',
			fontFamily: 'Arial, sans-serif',
			color: 'black',
		}}
		disabled
		/>

		{/* Calorie input */}
		<input
		type="text"
		value={dish.dish.dish_calories}
		onChange={(e) => onCaloriesChange(dish.dish.dish_id, e.target.value)}
		style={{
			gridColumn: 'span 2',
			padding: '3px 8px',
			fontWeight: 'bold',
			fontSize: '14px',
			fontFamily: 'Arial, sans-serif',
			color: 'black',
			width: '100%',
			textAlign: 'right',
		}}
		disabled
		/>

		{/* Healthy checkbox */}
		<input
		type="checkbox"
		checked={dish.dish.light_healthy}
		onChange={() => onCheckboxChange(dish.dish.dish_id, 'light_healthy')}
		style={{
			gridColumn: 'span 1',
		}}
		disabled
		/>

		{/* Sugar-free checkbox */}
		<input
		type="checkbox"
		checked={dish.dish.sugar_free}
		onChange={() => onCheckboxChange(dish.dish.dish_id, 'sugar_free')}
		style={{
			gridColumn: 'span 1',
		}}
		disabled
		/>      
    </div>
  );
};

export default DishDisplayComponent;
