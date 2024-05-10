import React, { Component } from 'react';
import { variables as bookingVariables } from './Variables';
import Day from './components/Day';
import './Booking.css';

// Define the PopupMessage component
const PopupMessage = ({ message }) => {
    return (
        <div className="popup">
            <span className="popup-message">{message}</span>
        </div>
    );
};



// Function to calculate available dishes by day and type
const calculateAvailableDishesByDayAndType = (currentDate, availableDishes, daysOfWeek) => {
    
    const availableDishesByDayAndType = {};

    daysOfWeek.forEach(day => {
    
        availableDishesByDayAndType[day] = availableDishes.filter(dish => {
            const dishDate = new Date(dish.date + 'T00:00:00Z');
            const options = { weekday: 'long', timeZone: 'UTC' };
            const dayName = dishDate.toLocaleDateString('en-US', options);
            return dayName === day;
        }).reduce((acc, dish) => {
            const type = dish.dish.dish_type;
            if (!acc[type]) {
            acc[type] = [];
            }
            acc[type].push(dish);
            return acc;
        }, {});
    });

    return availableDishesByDayAndType;

    };
  

export class Booking extends Component {
    
    constructor(props) {

        super(props);
        this.state = {
            availableDishes: [],
            currentDate: new Date(),
            unsavedChanges: [],
            savedDays: [],
            changesSaved: false, // Track whether changes are saved
        };
        this.loadSavedDays();
    } 



    componentDidMount() {

        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        this.setState({ currentDate: twoWeeksFromNow }, () => {
            this.refreshAvailableDishes();
            this.loadSavedDays();
        });
    }



    refreshAvailableDishes() {

        const weekNumber = this.getISOWeekNumber(this.state.currentDate);
        fetch(bookingVariables.API_URL + `booking/week/${weekNumber}`)
        .then(response => response.json())
        .then(data => {
            this.setState({ availableDishes: data.dishes });
        })
        .catch(error => console.error('Error:', error));
    }



    handleDateChange = (days) => {

        const newDate = new Date(this.state.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.setState({ currentDate: newDate }, this.refreshAvailableDishes);
    };



    handleSave = () => {

        const { unsavedChanges, savedDays } = this.state;
        // Convert selected dates to ISO string format
        const selectedDates = unsavedChanges.map(date => date.toISOString().split('T')[0]);
        // Find new dates to add to attendance and dates to remove from attendance
        const newDatesToAdd = selectedDates.filter(date => !savedDays.includes(date));
        const datesToRemove = savedDays.filter(date => !unsavedChanges.some(day => day.toISOString().split('T')[0] === date));

        // Check if there are any changes to save
        if (newDatesToAdd.length === 0 && datesToRemove.length === 0) {
            console.log("No changes to save.");
            return;
        }

        // Add new dates to attendance
        if (newDatesToAdd.length > 0) {
            this.addToAttendance(newDatesToAdd);
            this.setState({ changesSaved: true });
        }

        // Remove dates from attendance
        if (datesToRemove.length > 0) {
            this.removeFromAttendance(datesToRemove);
            this.setState({ changesSaved: true });
        }

        // Update savedDays with the new saved dates
        const newSavedDays = [...unsavedChanges.map(date => date.toISOString().split('T')[0])];
        this.setState({ savedDays: newSavedDays });
        // Save updated savedDays to local storage
        localStorage.setItem('savedDays', JSON.stringify(newSavedDays));


        // Hide the popup message after 3 seconds
        setTimeout(() => {
            this.setState({ changesSaved: false });
        }, 3000);
    };



    addToAttendance = (dates) => {

        fetch(bookingVariables.API_URL + 'booking/add-attendance/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dates),
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to add attendance');
            }
            return response.json();
        })
        .then(data => {
            console.log('Attendance added successfully:', data);
        })
        .catch(error => {
            console.error('Error adding attendance:', error);
        });
    };



    removeFromAttendance = (dates) => {

        fetch(bookingVariables.API_URL + 'booking/remove-attendance/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dates),
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to remove attendance');
            }
            return response.json();
        })
        .then(data => {
            console.log('Attendance removed successfully:', data);
        })
        .catch(error => {
            console.error('Error removing attendance:', error);
        });
    };



    toggleDaySelection = (day) => {

        const { unsavedChanges } = this.state;
        const selectedDateString = new Date(day).toISOString().split('T')[0];
        const index = unsavedChanges.findIndex(selectedDay => selectedDay.toISOString().split('T')[0] === selectedDateString);
        if (index === -1) {
        this.setState(prevState => ({ unsavedChanges: [...prevState.unsavedChanges, new Date(day)] }));
        } else {
        this.setState(prevState => ({ unsavedChanges: prevState.unsavedChanges.filter((_, idx) => idx !== index) }));
        }
    };



    getISOWeekNumber(date) {

        const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const diffInDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((diffInDays + startOfYear.getUTCDay() + 1) / 7);
        return weekNumber;
    }



    loadSavedDays() {

        const savedDays = JSON.parse(localStorage.getItem('savedDays')) || [];
        this.setState(prevState => ({
        savedDays,
        unsavedChanges: savedDays.map(date => new Date(date)),
        }));
    }



    render() {

        const { unsavedChanges, availableDishes, currentDate, changesSaved } = this.state;
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + daysOfWeek.length - 1);
        const weekRange = `${firstDayOfWeek.toLocaleDateString()} - ${lastDayOfWeek.toLocaleDateString()}`;
        const availableDishesByDayAndType = calculateAvailableDishesByDayAndType(
        currentDate,
        availableDishes,
        daysOfWeek
        );
        const popup = changesSaved ? <PopupMessage message="Changes saved" /> : null;



        return (

        <div>
            <h3 className="text-center">Booking Page</h3>
            <div className="text-center mb-3">
                <button onClick={() => this.handleDateChange(-7)} className="arrow-button">
                    &lt; Previous Week
                </button>
                <label style={{ margin: '0 10px', width: '200px', display: 'inline-block' }}>{weekRange}</label>
                <button onClick={() => this.handleDateChange(7)} className="arrow-button">
                    Next Week &gt;
                </button>
            </div>
            
            <div className="text-center mb-3">
                <button onClick={this.handleSave} className="save-button">Save Changes</button>
            
                {popup}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridGap: '20px' }}>
                
                {daysOfWeek.map((day, index) => {

                    const currentDate = new Date(firstDayOfWeek);
                    currentDate.setDate(currentDate.getDate() + index);
                    const oneWeekFromNow = new Date();
                    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
                    const isPastDate = currentDate < oneWeekFromNow;


                    return (

                        <Day
                            key={index}
                            date={currentDate}
                            dayName={day}
                            availableDishesByType={availableDishesByDayAndType[day] || {}}
                            isSelected={unsavedChanges.some(selectedDay => selectedDay.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0])}
                            isPastDate={isPastDate}
                            onClick={this.toggleDaySelection}
                        />
                    );
                })}
            </div>
        </div>
        );
    }
}

export default Booking;
