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
import {connect} from 'react-redux';

const mapStateToProps = state => {
    return {
        userId: state.userId
    }
}

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
        const {quizId} = this.props.match.params;
        const {quizDetails, classTeacher} = this.props.location.state;

        // console.log(classTeacher);

        let quiz_content = <QuizContent quizId={quizId} quizDetails={quizDetails} />
        let quiz_responses = <QuizResponses quizId={quizId} quizDetails={quizDetails} />
        let quiz_chart = <QuizChart quizId={quizId} quizDetails={quizDetails} />

        return (
            <div className="quiz-details-root">
                <div className="quiz-details">
                    <Navbar color="faded" light expand="md">
                        <NavbarToggler onClick={this.toggleNav} />
                        <Collapse isOpen={this.state.isNavOpen} navbar>
                            <Nav className="mx-auto" navbar>
                                <NavItem onClick={this.alterSelectedNavitem} className={this.state.showQuiz ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                    Quiz
                                </NavItem>
                                {this.props.userId === classTeacher && <NavItem onClick={this.alterSelectedNavitem} className={this.state.showResponse ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                    Responses
                                </NavItem>}
                                {this.props.userId === classTeacher && <NavItem onClick={this.alterSelectedNavitem} className={this.state.showChart ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                    Chart
                                </NavItem>}
                            </Nav>
                        </Collapse>
                    </Navbar>
                    {this.state.showQuiz && quiz_content}
                    {this.state.showResponse && quiz_responses}
                    {this.state.showChart && quiz_chart}
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(QuizDetails);