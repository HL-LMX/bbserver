import logo from './logo.svg';
import './App.css';
import { Home } from './Home';
import { MenuManagement } from './MenuManagement';
import { Booking } from './Booking';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div>
        <div className="App container" style={{ 
          backgroundColor: '#556A7A', 
          width: '100%', 
          height: '200px', 
          display: 'flex', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="App container" style={{ color: 'white' }}>
            <h1 className="d-flex justify-content-center m-3">
              Booking Bite Mx
            </h1>
            <nav className="navbar navbar-expand-sm navbar-dark">
              <ul className="navbar-nav">
                <li className="nav-item- m-1">
                  <NavLink
                    className="btn btn-light btn-outline"
                    to="/bookingbite"
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item- m-1">
                  <NavLink
                    className="btn btn-light btn-outline"
                    to="/bookingbite/booking"
                  >
                    Book Visits
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/bookingbite" />} />
          <Route path="/bookingbite/" element={<Home />} />
          <Route path="/bookingbite/menu-management" element={<MenuManagement />} />
          <Route path="/bookingbite/booking" element={<Booking />} />
        </Routes>

        <footer style={{
          backgroundColor: '#556A7A',
          color: 'white',
          textAlign: 'center',
          padding: '30px',
		  margin: '50px 0 0'
        }}>
          Hapag-Lloyd México 2024
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
