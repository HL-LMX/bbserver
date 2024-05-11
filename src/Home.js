import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Home extends Component {
    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <h3 className="card-title text-center m-5">Version 1.0</h3>

                    <div className="col-md-10 card bg-light">
                        <div className="row"> {/* Add a row to contain the columns */}
                            <div className="col-md-6">
                                <div className="b-3">
                                    <div className="card-body m-3 text-center"> {/* Center the text */}
                                        <p className="card-text" style={{fontSize: '1.5em'}}>In this page, you can:</p>
                                        <ul className="">
                                            <li className="list-group-item" style={{fontSize: '1.2em'}}> - Consult the dining hall menu</li>
                                            <li className="list-group-item" style={{fontSize: '1.2em'}}> - Register your visit</li>
                                            <li className="list-group-item" style={{fontSize: '1.2em'}}> - Help us plan food demand</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3 d-flex justify-content-center align-items-center"> {/* Half-width column for the SVG, center its contents */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-icon">
                                    <g>
                                        <path style={{ fill: '#FF6600' }} d="M32.681,220.596v201.532c0,4.513,3.658,8.17,8.17,8.17s8.17-3.657,8.17-8.17V220.596H32.681z"/>
                                        <circle style={{ fill: '#FF6600' }} cx="264.17" cy="256" r="166.128"/>
                                    </g>
                                    <g>
                                        <circle style={{ fill: '#FF822D' }} cx="264.17" cy="256" r="122.553"/>
                                        <path style={{ fill: '#FF6600' }} d="M73.532,81.702c-4.512,0-8.17,3.657-8.17,8.17v68.085h-16.34V89.872c0-4.513-3.658-8.17-8.17-8.17
                                            s-8.17,3.657-8.17,8.17v68.085H16.34V89.872c0-4.513-3.658-8.17-8.17-8.17S0,85.359,0,89.872v98.043
                                            c0,22.526,18.325,40.851,40.851,40.851s40.851-18.325,40.851-40.851V89.872C81.702,85.359,78.044,81.702,73.532,81.702z"/>
                                    </g>
                                    <path style={{ fill: '#FF6600' }} d="M495.66,231.489v190.638c0,4.513,3.657,8.17,8.17,8.17s8.17-3.657,8.17-8.17V280.511L495.66,231.489z"/>
                                    <path style={{ fill: '#FF6600' }} d="M512,280.511h-49.021V122.553c0-22.526,18.325-40.851,40.851-40.851H512V280.511z"/>
                                </svg>
                            </div>

                        </div>
                    </div>


                </div>
                <div className='m-5'>
                    <h4 className="card-text text-center">Ready to get started? Click on the "Book Visits" button in the menu at the top left corner.</h4>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md">
                        <div className="card bg-light mb-3" style={{ minHeight:'10rem' }}>
                            <div className="card-body d-flex flex-column justify-content-between">
                                <p className="card-text m-3" style={{fontSize: '1.5em'}}>Stay tuned for future updates! Additional features may include:</p>
                                
                                
                                <div className="row justify-content-between align-items-stretch">
                                    <div className="col" style={{ margin: '50px 10px'}}>
                                        <div className="card h-100" style={{ margin: '10px'}}>
                                            <div className="card-body text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#015C9E" className="bi bi-person-vcard m-3" viewBox="0 0 16 16">
                                                    <path d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5M9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8m1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5"/>
                                                    <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.96q.04-.245.04-.5C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1 1 0 0 1 1 12z"/>
                                                </svg>
                                                <p className="card-text">Digital attendance tracking (simply swipe your card)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ margin: '50px 10px'}}>
                                        <div className="card h-100" style={{ margin: '10px'}}>
                                            <div className="card-body text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#15A19F" className="bi bi-list-ol m-3" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
                                                    <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"/>
                                                </svg>
                                                <p className="card-text">Pre-selection of meals</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ margin: '50px 10px'}}>
                                        <div className="card h-100" style={{ margin: '10px'}}>
                                            <div className="card-body text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#97076C" className="bi bi-cart2 m-3" viewBox="0 0 16 16">
                                                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l1.25 5h8.22l1.25-5zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"/>
                                                </svg>
                                                <p className="card-text">Remote breakfast ordering</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ margin: '50px 10px'}}>
                                        <div className="card h-100" style={{ margin: '10px'}}>
                                            <div className="card-body text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#B51D0C" className="bi bi-pencil-square m-3" viewBox="0 0 16 16">
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                                </svg>
                                                <p className="card-text">Chef suggestions</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ margin: '50px 10px'}}>
                                        <div className="card h-100" style={{ margin: '10px'}}>
                                            <div className="card-body text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="#FCCA00" className="bi bi-star-fill m-3" viewBox="0 0 16 16">
                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                </svg>
                                                <p className="card-text">Participation in dish reviews or feedback</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
