// Calendar.js
import React from 'react';
import './Calendar.css';  // Import the CSS file for styling

class Calendar extends React.Component {
    state = {
        currentMonth: new Date(),
        selectedDate: new Date(),
    };

    renderHeader() {
        const monthOptions = { month: 'long' };
        const yearOptions = { year: 'numeric' };

        return (
            <div className="header">
                <button onClick={() => this.prevMonth()}>&lt;</button>
                <h2>
                    {this.state.currentMonth.toLocaleDateString(undefined, monthOptions)}
                    {' '}
                    {this.state.currentMonth.toLocaleDateString(undefined, yearOptions)}
                </h2>
                <button onClick={() => this.nextMonth()}>&gt;</button>
            </div>
        );
    }

    renderDays() {
        const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        return weekdays.map(day => (
            <div key={day} className="day">
                {day}
            </div>
        ));
    }

    renderCells() {
		const { currentMonth } = this.state;
		const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
		const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
		const startDate = new Date(monthStart);
		const endDate = new Date(monthEnd);
		const cells = [];
	
		// Calculate the number of blank cells before the first day of the month
		const startDayOfWeek = startDate.getDay();
		for (let i = 0; i < startDayOfWeek; i++) {
			cells.push(<div key={`blank-${i}`} className="cell blank-cell"></div>);
		}
	
		const cellSize = '2em'; // Set a fixed size for the cells (adjust as needed)
	
		while (startDate <= endDate) {
			const isToday = this.isSameDay(startDate, new Date());
			const isSelected = this.isSameDay(startDate, this.props.currentDate);
	
			cells.push(
				<div
					key={startDate.toISOString()}
					className={`cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
					style={{ height: cellSize, width: cellSize }}
					onClick={() => this.handleCellClick(startDate)}
				>
					{startDate.getDate()}
				</div>
			);
	
			startDate.setDate(startDate.getDate() + 1);
		}
	
		return cells;
	}
	
	isSameDay(date1, date2) {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	}
	
	handleCellClick(selectedDate) {
		// Handle cell click as needed, e.g., update state or perform other actions
		console.log('Cell clicked:', selectedDate);
	}
	
  

    isSameDay(date1, date2) {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    }

    handleDateClick(clickedDate) {
        this.setState({ selectedDate: clickedDate });
        // You can perform additional actions when a date is clicked
    }

    prevMonth() {
        const newDate = new Date(this.state.currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        this.setState({ currentMonth: newDate, selectedDate: newDate });
    }

    nextMonth() {
        const newDate = new Date(this.state.currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        this.setState({ currentMonth: newDate, selectedDate: newDate });
    }

    goToToday() {
        const today = new Date();
        this.setState({ currentMonth: today, selectedDate: today });
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                <div className="calendar-grid">
                    {this.renderDays()}
                    {this.renderCells()}
                </div>
                <button className="btn btn-primary" onClick={() => this.goToToday()}>Today</button>
            </div>
        );
    }
}

export default Calendar;
