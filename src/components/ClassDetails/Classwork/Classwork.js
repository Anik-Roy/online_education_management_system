import React, {Component} from 'react';
import './Classwork.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFileAlt, faTable, faSort} from '@fortawesome/free-solid-svg-icons';

class Classwork extends Component {
    render() {
        return (
            <div>
                {/* classwork info */}
                <div className="class-work-info">
                    <p>Assign work to your class here</p>
                    <ul className="class-work-info-list">
                        <li className="class-work-info-list-item">
                            <FontAwesomeIcon icon={faFileAlt} className="mr-3" />
                            Create assignments and questions
                        </li>
                        <li className="class-work-info-list-item">
                            <FontAwesomeIcon icon={faTable} className="mr-3" />
                            Use topics to organize classwork into modules or units
                        </li>
                        <li className="class-work-info-list-item">
                            <FontAwesomeIcon icon={faSort} className="mr-3" />
                            Order work the way you want students to see it
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default Classwork;