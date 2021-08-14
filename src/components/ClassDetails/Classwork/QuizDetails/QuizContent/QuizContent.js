import React, { Component } from 'react';
import './QuizContent.css';
import { Formik, Form, Field } from 'formik';
import { connect} from 'react-redux';
import { Alert } from 'reactstrap';
// import lodash from 'lodash';
import { submitQuiz, fetchQuizResponses } from '../../../../../redux/actionCreators';

const _ = require('lodash');

const mapStateToProps = state => {
    return {
        userId: state.userId,
        quizSubmissionSuccessMsg: state.quizSubmissionSuccessMsg,
        quizSubmissionErrorMsg: state.quizSubmissionErrorMsg,
        quizResponses: state.quizResponses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        submitQuiz: user_response => dispatch(submitQuiz(user_response)),
        fetchQuizResponses: quiz_id => dispatch(fetchQuizResponses(quiz_id))
    }
}

class QuizContent extends Component {
    onSubmitClick = (submitted_data, questions, quizId) => {
        let r = window.confirm('You response will be submitted and you will no longer be able to submit another response! Confirm submission?');

        let user_response = {};

        // console.log(submitted_data);
        if(r === true) {
            let total_correct = 0;
            let total_wrong = 0;
    
            questions.forEach((question, idx) => {
                if(question.answer === submitted_data[idx]) {
                    total_correct++;
                } else {
                    total_wrong++;
                }
            });

            user_response = {
                user_answer: {...submitted_data},
                total_correct,
                total_wrong,
                user_id: this.props.userId,
                quiz_id: quizId
            }
            this.props.submitQuiz(user_response);

            // console.log('total correct > '+total_correct, 'total wrong > '+total_wrong);
            return;
        }

        // console.log('Submission canceled!');
    }
    
    componentDidMount() {
        this.props.fetchQuizResponses(this.props.quizDetails.key);
    }

    componentDidUpdate(previousProps, previousState) {
        if(previousProps !== this.props) {
            this.props.fetchQuizResponses(this.props.quizDetails.key);
        }
    }

    render() {
        let dueDate = new Date(this.props.quizDetails.data.dueDate);
        let currentDate = new Date();
        // console.log(this.props.quizDetails.key, this.props.quizResponses);
        
        let already_submitted = _.find(this.props.quizResponses, {user_id: this.props.userId});
        let submitBtnDisabled = false;

        if(already_submitted) {
            submitBtnDisabled = true;
        }

        let dateOverMsg = '';
        let alreadySubmittedMsg = '';

        if(currentDate > dueDate) {
            // console.log('Due date is over!');
            dateOverMsg = 'Due date is over!';
        } else if(already_submitted) {
            alreadySubmittedMsg = "You've already submitted response of this quiz!";
        }

        let checkboxDisabled = dateOverMsg === "" ? false : true;

        let quiz_questions = this.props.quizDetails.data.quiz_questions.map((question, idx) => (
            <li key={`quizquestion-${idx}`} className="card mt-2 p-3">
                <h3 className="card-title text-dark font-weight-bold">{idx+1}. {question.question}</h3>
                {
                    [...Array(question.optionsLength).keys()].map(x => (
                        <div key={`question-${idx}-option-${x}`}>
                            <Field disabled={checkboxDisabled} type="radio" name={idx} id={`question-${idx}-answers-${x}`} value={`option${x+1}`} />
                            <label htmlFor={`question-${idx}-answers-${x}`}>&nbsp;{question[`option${x+1}`]}</label>
                        </div>
                    ))
                }
                <div>
                    <label htmlFor={`question-${idx}-answers-4`}>Correct answer: {question.answer}</label>
                </div>
            </li>
        ));

        let formik_initial_values = {};

        this.props.quizDetails.data.quiz_questions.forEach((question, idx) => {
            formik_initial_values[`${idx}`] = '';    
        });

        // console.log(formik_initial_values);
        return (
            <div className="quiz-content-root">
                <div className="quiz-content">
                    {this.props.quizSubmissionSuccessMsg && <Alert color="success">{this.props.quizSubmissionSuccessMsg}</Alert>}
                    {this.props.quizSubmissionErrorMsg && <Alert color="danger">{this.props.quizSubmissionErrorMsg}</Alert>}
                    <h3 className="text-center m-3">Take participate in the {this.props.quizDetails.data.title}</h3>
                    {dateOverMsg !== "" && <h5 className="text-center p-2 mx-auto" style={{color: "#D8000C", backgroundColor: "#FFD2D2", width: "460px"}}>Due date was {dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}!<br/> You can no longer participate in this tutorial.</h5>}
                    {alreadySubmittedMsg !== "" && <h5 className="text-center p-2 mx-auto" style={{color: "#9F6000", backgroundColor: "#FEEFB3", width: "460px"}}>{alreadySubmittedMsg}</h5>}
                    <Formik
                        initialValues={
                            formik_initial_values
                        }
                        onSubmit={values => {
                            this.onSubmitClick(values, this.props.quizDetails.data.quiz_questions, this.props.quizId);
                        }}>
                            {
                                ({values}) => (
                                    <Form>
                                        <div>
                                            <ol>
                                                {quiz_questions}
                                            </ol>
                                        </div>
                                        <div className="text-center mb-3">
                                            <button disabled={checkboxDisabled || submitBtnDisabled} className="btn btn-primary" type="submit" style={{cursor: checkboxDisabled || submitBtnDisabled ? "no-drop": 'pointer'}}>Submit</button>
                                        </div>
                                    </Form>
                                )
                            }
                    </Formik>
                    {/* <div className="quiz-questions" id="quiz">
                        <ol>
                            {quiz_questions}
                        </ol>
                    </div> */}
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizContent);