import React, { useState } from 'react';
import './NavigationBar.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {toogleClassModal, toogleJoinClassModal, logout} from '../../redux/actionCreators';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const mapStateToProps = state => {
  return {
    token: state.token,
    userId: state.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
      toogleClassModal: () => dispatch(toogleClassModal()),
      toogleJoinClassModal: () => dispatch(toogleJoinClassModal()),
      logout: () => dispatch(logout())
  }
}

const NavigationBar = props => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  let dropdownMenu = null;

  if(props.token !== null) {
    dropdownMenu = (
      <DropdownMenu right>
        <DropdownItem>
          <Link to="/profile" className="text-decoration-none">Go to Profile</Link>
        </DropdownItem>
        <DropdownItem onClick={props.logout}>
          Logout
        </DropdownItem>
      </DropdownMenu>
    )
  } else {
    dropdownMenu = (
      <DropdownMenu right>
        <DropdownItem>
          <Link to="/signup" className="text-decoration-none">Signup</Link>
        </DropdownItem>
        <DropdownItem>
          <Link to="/login" className="text-decoration-none">Login</Link>
        </DropdownItem>
      </DropdownMenu>
    )
  }

  return (
    <div className="container-fluid">
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">SUST LMS SYSTEM</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Create/Join a Class
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={props.toogleJoinClassModal}>
                  Join Class
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={props.toogleClassModal}>
                  Create Class
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Profile
              </DropdownToggle>
              {dropdownMenu}
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);