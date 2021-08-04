import React, {Component} from 'react';
import './AssignmentDetails.css';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Nav,
    NavItem
} from 'reactstrap';
import AssignmentContent from './AssignmentContent/AssignmentContent';
import AssignmentResponses from './AssignmentResponses/AssignmentResponses';
import AssignmentChart from './AssignmentChart/AssignmentChart';

class AssignmentDetails extends Component {
    state = {
        isNavOpen: false,
        showAssignment: true,
        showResponse: false,
        showChart: false,
    }

    toggleNav = () => {
        this.setState({
            ...this.state,
            isNavOpen: !this.state.isNavOpen
        })
    }

    alterSelectedNavitem = e => {
        const navItem = e.target.innerText;
        
        switch(navItem) {
            case 'Assignment':
                this.setState({
                    ...this.state,
                    showAssignment: true,
                    showResponse: false,
                    showChart: false
                });
                console.log('Assignment');
                break;
            case 'Responses':
                this.setState({
                    ...this.state,
                    showAssignment: false,
                    showResponse: true,
                    showChart: false
                });
                console.log('Responses');
                break;
            case 'Chart':
                this.setState({
                    ...this.state,
                    showAssignment: false,
                    showResponse: false,
                    showChart: true
                });
                console.log('Chart');
                break;

            default:
                break;
        }
    }

    render() {
        const {classId, assignmentId} = this.props.match.params;
        // console.log(classId, assignmentId);
        const {assignmentDetails} = this.props.location.state;

        let assignment_content = <AssignmentContent assignmentDetails={assignmentDetails} />
        let assignment_responses = <AssignmentResponses assignmentId={assignmentId} assignmentDetails={assignmentDetails} />
        let assignment_chart = <AssignmentChart />

        return (
            <div className="assignment-details-root">
                <Navbar color="faded" light expand="md">
                    <NavbarToggler onClick={this.toggleNav} />
                    <Collapse isOpen={this.state.isNavOpen} navbar>
                        <Nav className="mx-auto" navbar>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showAssignment ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Assignment
                            </NavItem>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showResponse ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Responses
                            </NavItem>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showChart ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Chart
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                {this.state.showAssignment && assignment_content}
                {this.state.showResponse && assignment_responses}
                {this.state.showChart && assignment_chart}
            </div>
        );
    }
}

export default AssignmentDetails;