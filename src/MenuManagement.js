// MenuManagement.js

import React, { Component } from 'react';
import { variables } from './Variables';
import MuiCalendar from './components/MuiCalendar';
import CourseComponent from './components/CourseComponent';

import './MenuManagement.css';

const lockedDaysAhead = 10;  // Number of days locked from today. This avoids chef changing food of days blocked for users.


export class MenuManagement extends Component {

	constructor(props) {
		
		super(props);

		const currentDate = new Date();
		currentDate.setDate(currentDate.getDate() + 7);

		while (currentDate.getDay() !== 1) {
			currentDate.setDate(currentDate.getDate() + 1);
		}

		this.state = {
			currentDate: currentDate,
			selectedDate: currentDate,
			dishes: [],
			attendees: 0,
			allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
		};

		this.handleSave = this.handleSave.bind(this);
  	}

	componentDidMount() {
		
		this.fetchDishes(this.state.currentDate);
	}



	fetchDishes = async (date) => {

		const formattedDate = date.toISOString().split('T')[0];
		const apiUrl = variables.API_URL + `chef-management/day-dishes/${formattedDate}/`;

		try {

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			this.updateDishes(data);

		} catch (error) {

			console.error('Error fetching data:', error);
			throw error;
		}
	};



	updateDishes = (data) => {

		const { dishes, attendance } = data;

		const formattedDishes = dishes.map((dish) => ({
			...dish,
			quantity: dish.quantity || 0,
			}));
		
			const formattedAttendees = attendance !== null && attendance !== undefined ? attendance : 0;
		
			this.setState({
			dishes: formattedDishes,
			attendees: formattedAttendees,
		});
	};
  


	handleSave = async (category, data) => {

		const apiUrl = variables.API_URL + 'chef-management/create/';

		const newDishData = {
			dish: {
				dish_name: data.dishName,
				dish_description: 'Healthy',
				dish_type: category,
				dish_calories: data.calories,
				light_healthy: data.isHealthy,
				sugar_free: data.isSugarFree
			},
			dates: [this.state.selectedDate.toISOString().split('T')[0]]
		};

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				},
				body: JSON.stringify(newDishData),
			});

			if (!response.ok) {
				const errorResponse = await response.json();
				console.error('Error response from server:', errorResponse);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			this.fetchDishes(this.state.selectedDate);

		} catch (error) {
			console.error('Error creating new dish:', error);
		}
	};



  	handleDateChange = async (days) => {

		const newDate = new Date(this.state.selectedDate);
		newDate.setDate(newDate.getDate() + days);

		while (!this.state.allowedDays.includes(this.getDayName(newDate))) {
			newDate.setDate(newDate.getDate() + (days > 0 ? 1 : -1));
		}

		try {
			await this.fetchDishes(newDate);
			this.setState({
				selectedDate: newDate,
			});
		} catch (error) {
			console.error('Error fetching dishes:', error);
		}
  	};



	handleCalendarChange = (newValue) => {

		this.setState({ selectedDate: newValue });
		this.fetchDishes(newValue);
	};



	getDayName = (date) => {

		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return days[date.getDay()];
	};


	handleDelete = async (dishId, dateHasDishId) => {
		const apiUrl = variables.API_URL + 'chef-management/delete-dish-from-date/';
	  
		try {
			const response = await fetch(apiUrl, {
				method: 'DELETE',
				headers: {
				'Content-Type': 'application/json',
				},
				body: JSON.stringify({ date_has_dish_ids: [dateHasDishId] }),
			});
		
			if (!response.ok) {
				const errorResponse = await response.json();
				console.error('Error response from server:', errorResponse);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		
			
			// Refresh dishes after deletion
			await this.fetchDishes(this.state.selectedDate);
			// alert('Dish deleted successfully');

		} catch (error) {
			console.error('Error deleting dish:', error);
		}
	  };
	  



  render() {

    const { selectedDate, dishes, attendees } = this.state;

    const categories = {
		Soup: [],
		'Main Course': [],
		Side: [],
		Dessert: [],
		Water: [],
    };

    dishes.forEach((dish) => {

		const category = dish.dish.dish_type || 'Other';

		if (categories[category]) {
			categories[category].push(dish);
		}
    });

    const modificationDueDate = new Date();
    modificationDueDate.setDate(modificationDueDate.getDate() + lockedDaysAhead);
    const isPastDate = selectedDate < modificationDueDate;



    return (

		<div>
			<h3 className="text-center">Menu Management</h3>

			<div className="d-flex justify-content-center mb-3">
				<button className="btn btn-light mm-btn" onClick={() => this.handleDateChange(-1)}>
					Previous Day
				</button>

				<span className="mx-3" style={{ fontSize: '24px', margin: '1rem auto', width: '200px', display: 'inline-block', textAlign: 'center' }}>
					{selectedDate.toDateString()}
				</span>

				<button className="btn btn-light mm-btn" onClick={() => this.handleDateChange(1)}>
					Next Day
				</button>
			</div>


			<div className="text-center mb-3" style={{ fontSize: '24px' }}>
				<div>Attendees: {attendees}</div>
			</div>
			
			<div className="menu-sections">
				<div className="bg-secondary text-light rounded p-3">
					<h4 className="text-center">Calendar</h4>
					<MuiCalendar
					currentDate={selectedDate}
					onChange={this.handleCalendarChange}
					/>
				</div>

				{Object.keys(categories).map(category => (

					<CourseComponent
						key={category}
						category={category}
						title={category}
						dishes={categories[category]}
						onSave={this.handleSave}
						onDelete={this.handleDelete}
						isPastDate={isPastDate}
					/>

				))}
			</div>
		</div>
    );
  }
}

export default MenuManagement;
