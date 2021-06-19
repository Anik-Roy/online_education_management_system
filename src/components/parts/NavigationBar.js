import React, { useState } from 'react';
import './NavigationBar.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
//   NavItem,
//   NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
//   NavbarText
} from 'reactstrap';

const mapStateToProps = state => {
  return {
    token: state.token,
    userId: state.userId,
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
        <DropdownItem>
          <Link to="/logout" className="text-decoration-none">Logout</Link>
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
        <NavbarBrand href="/">Sust Online Education</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Create/Join a Class
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Option 1
                </DropdownItem>
                <DropdownItem>
                  Option 2
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  Reset
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

export default connect(mapStateToProps)(NavigationBar);