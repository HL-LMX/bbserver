import React from 'react';
import Dish from './Dish';

const Day = ({ date, dayName, availableDishesByType, isSelected, isPastDate, onClick }) => {

    const dayColors = {
        Monday: 'hsl(345, 60%, 40%)',    // Pink
        Tuesday: 'hsl(45, 60%, 50%)',     // Yellow
        Wednesday: 'hsl(145, 60%, 40%)',  // Green
        Thursday: 'hsl(185, 70%,40%)',  // Cyan
        Friday: 'hsl(285, 40%, 40%)',     // Purple
    };

    
    let backgroundColor = '';

    if (isSelected && !isPastDate) {
        backgroundColor = '#FF6600'; // If the day is selected and not in the past, set background color to regular green
    } else if (isSelected && isPastDate) {
        backgroundColor = '#ffbe95'; // If the day is selected and in the past, set background color to pale green
    } else if (isPastDate) {
        backgroundColor = 'lightgrey'; // If the day is in the past and not selected, set background color to grey
    } else {
        backgroundColor = dayColors[dayName] || '#FFFFFF'; // Otherwise, use the color based on the day of the week
    }

    // Function to handle day selection
    const handleDayClick = () => {
        // Only allow selection if the clicked day is in the future
        if (!isPastDate) {
            onClick(date.toISOString().split('T')[0]);
        }
    };



    return (

        <div
            style={{
                backgroundColor,
                padding: '1em',
                borderRadius: '0.5em',
                marginBottom: '1em',
                cursor: isPastDate ? 'default' : 'pointer', // Change cursor style based on whether the day is in the past
            }}
            onClick={handleDayClick} // Pass date string to parent onClick handler if the day is in the future
        >
            <h4 style={{ textAlign: 'center', color: 'white' }}>
                {dayName} - {date.getDate()}
            </h4>

            {Object.entries(availableDishesByType).map(([type, dishes]) => (

                <div
                    key={`${dayName}-${type}`}
                    style={{
                        marginBottom: '1em',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        padding: '1em',
                        borderRadius: '0.5em'
                    }}
                >
                    <h5 style={{ color: 'black', margin: '0.5rem 0' }}>{type}</h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                        <div style={{ gridColumn: 'span 3', color: 'black', fontWeight: 'bold' }}></div>
                        <div style={{ color: 'black', fontWeight: 'bold', fontSize: '.8rem' }}>Calories</div>
                        <div style={{ color: 'black', fontWeight: 'bold', fontSize: '.7rem' }}>Light & Healthy</div>
                        <div style={{ color: 'black', fontWeight: 'bold', fontSize: '.8rem' }}>Sugar Free</div>
                    </div>

                    {dishes.map(dish => (
                        <Dish key={dish.dish.dish_id} dish={dish} />
                    ))}

                </div>
            ))}
        </div>
    );
};

export default Day;
