import React, { Component } from 'react';
import './QuizDetails.css';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Nav,
    NavItem
} from 'reactstrap';
import QuizContent from './QuizContent/QuizContent';
import QuizResponses from './QuizResponses/QuizResponses';
import QuizChart from './QuizChart/QuizChart';

class QuizDetails extends Component {
    state = {
        isNavOpen: false,
        showQuiz: true,
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
        // console.log(item);
        switch(navItem) {
            case 'Quiz':
                this.setState({
                    ...this.state,
                    showQuiz: true,
                    showResponse: false,
                    showChart: false
                });
                console.log('Quiz');
                break;
            case 'Responses':
                this.setState({
                    ...this.state,
                    showQuiz: false,
                    showResponse: true,
                    showChart: false
                });
                console.log('Responses');
                break;
            case 'Chart':
                this.setState({
                    ...this.state,
                    showQuiz: false,
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
        const {classId, quizId} = this.props.match.params;
        const {quizDetails} = this.props.location.state;

        let quiz_content = <QuizContent quizId={quizId} quizDetails={quizDetails} />
        let quiz_responses = <QuizResponses quizId={quizId} />
        let quiz_chart = <QuizChart />

        return (
            <div className="quiz-details-root">
                <Navbar color="faded" light expand="md">
                    <NavbarToggler onClick={this.toggleNav} />
                    <Collapse isOpen={this.state.isNavOpen} navbar>
                        <Nav className="mx-auto" navbar>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showQuiz ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Quiz
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
                {this.state.showQuiz && quiz_content}
                {this.state.showResponse && quiz_responses}
                {this.state.showChart && quiz_chart}
            </div>
        );
    }
}

export default QuizDetails;