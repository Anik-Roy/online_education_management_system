import React from 'react';
import './ClassCard.css';
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faIdCardAlt, faFolder } from '@fortawesome/free-solid-svg-icons';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {toogleUnenrollClassModal, selectedClasstoUnenroll} from '../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        userId: state.userId,

        // modal open/hide
        

        // loading indicator
        
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toogleUnenrollClassModal: () => dispatch(toogleUnenrollClassModal()),
        selectedClasstoUnenroll: cls => dispatch(selectedClasstoUnenroll(cls))
    }
}

const ClassCard = props => {
    let classCode = props.classCode;
    // console.log(props);
    return (
        <div className="class-root border rounded">
            <Link to={{pathname: `/class/${classCode}`, state: { classDetails: props.details }}} query={{ the: 'query' }} className="class-upper text-decoration-none">
                <h5 className="class-title">{props.details.className} {props.details.subject}</h5>
                <span className="class-teacher">{props.details.firstName} {props.details.lastName}</span>
                <span>Class code: {classCode}</span>
            </Link>
            
            <UncontrolledDropdown className="class-dropdown">
              <DropdownToggle>
                <FontAwesomeIcon icon={faEllipsisV} className="menu-icon" />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={() => {
                    console.log(props);
                    props.selectedClasstoUnenroll({...props.details, enrollId: props.enrollId})
                    props.toogleUnenrollClassModal();
                }}>
                  Un-enroll
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <div className="teacher-image">
                <img src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
            </div>
            <div className="class-icons">
                <FontAwesomeIcon className="icon" icon={faIdCardAlt} />
                <FontAwesomeIcon className="icon" icon={faFolder} />
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassCard);