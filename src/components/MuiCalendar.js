// MuiCalendar.js

import * as React from 'react';
import dayjs from 'dayjs'; // Import dayjs
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export default function MuiCalendar({ currentDate, onChange }) {
	// Convert currentDate to proper format using dayjs
	const formattedCurrentDate = dayjs(currentDate); // Convert to dayjs object

	return (
		
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DateCalendar
				value={formattedCurrentDate} // Set value prop to formattedCurrentDate
				onChange={(newValue) => onChange(newValue.toDate())} // Convert newValue to JavaScript Date

				renderDay={(day, selectedDate, DayComponentProps) => {

				// Check if the day matches the current date
				if (dayjs(day).format("YYYY-MM-DD") === formattedCurrentDate.format("YYYY-MM-DD")) {
					// Mark the current date as selected
					return <DayComponentProps.selected {...DayComponentProps} />;
				}
				// Return empty day component
				return <DayComponentProps.empty {...DayComponentProps} />;
				}}
				
				displayWeekNumber
			/>
		</LocalizationProvider>
	);
}
