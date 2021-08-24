import React, { Component } from 'react';
import './QuizContent.css';
import { Formik, Form, Field } from 'formik';
import { connect} from 'react-redux';
import { Alert } from 'reactstrap';
// import lodash from 'lodash';
import { submitQuiz, fetchQuizResponses } from '../../../../../redux/actionCreators';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Toast, ToastBody, FormGroup, Label, Input} from 'reactstrap';
import axios from 'axios';

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
    state = {
        quizQuestions: [],
        selectedQuestion: null,
        selectedQuestionId: null,
        isOpen: false,
        showUpdated: {
            open: false,
            id: null
        },
        quizSubmitted: false
    }

    onSubmitClick = (submitted_data, questions, quizId) => {
        console.log(submitted_data);
        let r = window.confirm('You response will be submitted and you will no longer be able to submit another response! Confirm submission?');

        let user_response = {};

        // console.log(submitted_data);
        if(r === true) {
            let total_correct = 0;
            let total_wrong = 0;
    
            questions.forEach((question, idx) => {
                if(question.descriptiveQuestion) {
                    let user_answer = submitted_data[idx];
                    submitted_data[idx] = {user_answer: user_answer, marks: ""}
                } else {
                    if(question.answer === submitted_data[idx]) {
                        total_correct++;
                    } else {
                        total_wrong++;
                    }
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
        let quiz_id = this.props.quizDetails.key;
        axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/quizes/${quiz_id}.json`)
            .then(response => {
                this.setState({
                    quizQuestions: response.data.quiz_questions
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    componentDidUpdate(previousProps, previousState) {
        // if(previousProps !== this.props) {
        //     this.props.fetchQuizResponses(this.props.quizDetails.key);
        // }
    }
    
    handleEditQuestion = (questionId, question) => {
        // console.log(this.props.quizDetails.key, questionId);
        // console.log(question);
        this.setState({
            isOpen: true,
            selectedQuestion: question,
            selectedQuestionId: questionId
        })
    }

    handleOnChange = e => {
        if(e.target.name === "question") {
            let tempSelectedQuestion = {...this.state.selectedQuestion};
            tempSelectedQuestion.question = e.target.value;
            this.setState({
                selectedQuestion: tempSelectedQuestion
            });
        } else if(e.target.name === "marks") {
            let tempSelectedQuestion = {...this.state.selectedQuestion};
            tempSelectedQuestion.marks = e.target.value;
            this.setState({
                selectedQuestion: tempSelectedQuestion
            });
        } else if(e.target.name.includes('option') || e.target.name === 'answer') {
            let tempSelectedQuestion = {...this.state.selectedQuestion};
            tempSelectedQuestion[e.target.name] = e.target.value;
            this.setState({
                selectedQuestion: tempSelectedQuestion
            });
        }
    }

    handleQuestionUpdate = e => {
        e.preventDefault();
        // console.log(this.props.quizDetails.data.quiz_questions);
        // let quiz_questions = [...this.props.quizDetails.data.quiz_questions];
        let quiz_questions = [...this.state.quizQuestions];
        // console.log(this.state.selectedQuestionId);
        quiz_questions[this.state.selectedQuestionId] = this.state.selectedQuestion;
        console.log(quiz_questions);
        let quiz_id = this.props.quizDetails.key;

        axios.patch(`https://sust-online-learning-default-rtdb.firebaseio.com/quizes/${quiz_id}.json`, {"quiz_questions": quiz_questions})
            .then(response => {
                console.log(response);
                if(response.status === 200) {
                    console.log('updated');
                    this.setState({
                        quizQuestions: quiz_questions,
                        showUpdated: {
                            open: true,
                            id: this.state.selectedQuestionId
                        }
                    });

                    setTimeout(() => {
                        this.setState({
                            showUpdated: {
                                open: false,
                                id: null
                            }
                        })
                    }, 2000);
                    this.toggle();
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    addOption = () => {
        const key = "option"+(this.state.selectedQuestion?.optionsLength+1);
        let tmpSelectedQuestion = {...this.state.selectedQuestion};
        tmpSelectedQuestion.optionsLength = tmpSelectedQuestion.optionsLength + 1;
        tmpSelectedQuestion[key] = "";

        // tmpOptions.push(<FormGroup key={key}>
        //     <Label htmlFor={key}>Option {this.state.questionOptions.length+1}</Label>
        //     <Input
        //         label={"Option "+this.state.questionOptions.length+1}
        //         name={key}
        //         type="text"
        //         required
        //         onChange={this.handleChange}
        //     />
        // </FormGroup>)

        // let initialValues = {...this.state.initialValues, [key]: "", optionsLength: tmpOptions.length};

        this.setState({
            selectedQuestion: tmpSelectedQuestion
        });
    }

    removeOption = () => {
        const key = "option"+(this.state.selectedQuestion?.optionsLength);
        let tmpSelectedQuestion = {...this.state.selectedQuestion};
        
        if(tmpSelectedQuestion.optionsLength > 0) {
            tmpSelectedQuestion.optionsLength = tmpSelectedQuestion.optionsLength - 1;
        }
        delete tmpSelectedQuestion[key];

        this.setState({
            selectedQuestion: tmpSelectedQuestion
        });
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
        //this.props.quizDetails.data.quiz_questions.map
        // console.log(this.props);

        let quiz_questions = this.state.quizQuestions.map((question, idx) => (
            <li key={`quizquestion-${idx}`} className="card mt-2 p-3">
                <div style={{display: "flex", alignItems: "center"}}>
                    <h3 className="card-title text-dark font-weight-bold">
                        {idx+1}. {question.question}
                        <span className="ml-2 text-info">
                            {question.descriptiveQuestion ? `Marks: ${question.marks}` : "Marks: 1"}
                        </span>
                        {this.props.userId === this.props.quizDetails.data.author_id && <FontAwesomeIcon onClick={() => this.handleEditQuestion(idx, question)} style={{cursor: "pointer"}} className="ml-5" icon={faPencilAlt} />}
                    </h3>
                </div>
                {question.descriptiveQuestion && <Field as="textarea" name={idx} />}
                {
                    [...Array(question.optionsLength).keys()].map(x => (
                        <div key={`question-${idx}-option-${x}`}>
                            <Field disabled={checkboxDisabled} type="radio" name={idx} id={`question-${idx}-answers-${x}`} value={`option${x+1}`} />
                            <label htmlFor={`question-${idx}-answers-${x}`}>&nbsp;{question[`option${x+1}`]}</label>
                        </div>
                    ))
                }
                {!question.descriptiveQuestion && <div>
                    <label htmlFor={`question-${idx}-answers-4`}>Correct answer: {question.answer}</label>
                </div>}
                {this.state.showUpdated.id === idx && (
                    <div className="bg-success my-2 rounded">
                        <Toast isOpen={this.state.showUpdated.open}>
                            <ToastBody>
                                Question updated!
                            </ToastBody>
                        </Toast>
                    </div>
                )}
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
                                        {!checkboxDisabled && !submitBtnDisabled && this.props.quizSubmissionSuccessMsg === "" && <div className="text-center mb-3">
                                            <button className="btn btn-primary" type="submit" style={{cursor: checkboxDisabled || submitBtnDisabled ? "no-drop": 'pointer'}}>Submit</button>
                                        </div>}
                                    </Form>
                                )
                            }
                    </Formik>
                    <Modal isOpen={this.state.isOpen} toggle={this.toggle}>
                        <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
                        <ModalBody>
                            {this.state.selectedQuestion?.descriptiveQuestion && <form>
                                <div className="form-group">
                                    <label htmlFor="question">Question</label>
                                    <input type="text" className="form-control" id="question" name="question" value={this.state.selectedQuestion?.question} onChange={this.handleOnChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="marks">Marks</label>
                                    <input type="number" className="form-control" id="marks" name="marks" value={this.state.selectedQuestion?.marks} onChange={this.handleOnChange} />
                                </div>
                                <ModalFooter>
                                    <Button outline color="primary">Update</Button>{' '}
                                    <Button outline color="secondary" onClick={this.toggle}>Cancel</Button>
                                </ModalFooter>
                            </form>}
                            {/* {console.log(this.state.selectedQuestion)} */}
                            {!this.state.selectedQuestion?.descriptiveQuestion && <form onSubmit={e => this.handleQuestionUpdate(e)}>
                                <div className="form-group">
                                    <label htmlFor="question">Question</label>
                                    <input type="text" className="form-control" id="question" name="question" value={this.state.selectedQuestion?.question} onChange={this.handleOnChange} />
                                </div>
                                {[...Array(this.state.selectedQuestion?.optionsLength).keys()].map(x => {
                                      return (
                                        <div className="form-group" key={"question-option-"+x}>
                                            <label htmlFor="question">Option {x+1}</label>
                                            <input type="text" className="form-control" id={"option"+(x+1)} required name={"option"+(x+1)} value={this.state.selectedQuestion?this.state.selectedQuestion[`option${x+1}`]:""} onChange={this.handleOnChange} />
                                        </div>
                                      )  
                                })}
                                {this.state.selectedQuestion?.optionsLength > 0 && <Button outline color="warning" onClick={e => this.removeOption()}>Remove option</Button>}&nbsp;
                                <Button outline color="primary" onClick={e => this.addOption()}>Add option</Button>
                                <FormGroup>
                                    <Label htmlFor="answer">Answer</Label>
                                    <Input required type="select" name="answer" onChange={this.handleOnChange}>
                                    <option key={'option'} value="">__SELECT_ANSWER__</option>
                                        {[...Array(this.state.selectedQuestion?.optionsLength).keys()].map(x => <option key={'option-'+(x+1)} value={`option${x+1}`}>Option {x+1}</option>)}
                                    </Input>
                                </FormGroup>
                                <ModalFooter>
                                    <Button outline color="primary">Update</Button>{' '}
                                    <Button outline color="secondary" onClick={this.toggle}>Cancel</Button>
                                </ModalFooter>
                            </form>}
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizContent);