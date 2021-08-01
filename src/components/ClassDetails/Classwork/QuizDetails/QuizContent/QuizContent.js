import React, { Component } from 'react';
import { Formik, Form, Field } from 'formik';
import { connect} from 'react-redux';
import { Alert } from 'reactstrap';
import { submitQuiz } from '../../../../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        quizSubmissionSuccessMsg: state.quizSubmissionSuccessMsg,
        quizSubmissionErrorMsg: state.quizSubmissionErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        submitQuiz: user_response => dispatch(submitQuiz(user_response))
    }
}

class QuizContent extends Component {
    onSubmitClick = (submitted_data, questions, quizId) => {
        let r = window.confirm('You response will be submitted and you will no longer be able to submit another response! Confirm submission?');

        let user_response = {};

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
    render() {
        let quiz_questions = this.props.quizDetails.data.quiz_questions.map((question, idx) => (
            <li key={`quizquestion-${idx}`} className="card mt-2 p-3" style={{backgroundColor: '#fac66b'}}>
                <h3 className="card-title text-dark font-weight-bold">{idx+1}. {question.question}</h3>
                <div>
                    <Field type="radio" name={idx} id={`question-${idx}-answers-1`} value="option1" />
                    <label htmlFor={`question-${idx}-answers-1`}>&nbsp;{question.option1}</label>
                </div>

                <div>
                    <Field type="radio" name={idx} id={`question-${idx}-answers-2`} value="option2" />
                    <label htmlFor={`question-${idx}-answers-2`}>&nbsp;{question.option2}</label>
                </div>

                <div>
                    <Field type="radio" name={idx} id={`question-${idx}-answers-3`} value="option3" />
                    <label htmlFor={`question-${idx}-answers-3`}>&nbsp;{question.option3}</label>
                </div>

                <div>
                    <Field type="radio" name={idx} id={`question-${idx}-answers-4`} value="option4" />
                    <label htmlFor={`question-${idx}-answers-4`}>&nbsp;{question.option4}</label>
                </div>
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
            <div>
                {this.props.quizSubmissionSuccessMsg && <Alert color="success">{this.props.quizSubmissionSuccessMsg}</Alert>}
                {this.props.quizSubmissionErrorMsg && <Alert color="danger">{this.props.quizSubmissionErrorMsg}</Alert>}
                <h3 className="text-center m-3">Take participate in the {this.props.quizDetails.data.title}</h3>
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
                                        {/* <Field type="text" name="name" />
                                        <Field type="number" name="age" /> */}
                                        <ol>
                                            {quiz_questions}
                                        </ol>
                                    </div>
                                    <div className="text-center mb-3">
                                        <button className="btn btn-primary" type="submit">Submit</button>
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
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizContent);