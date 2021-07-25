import React, {Component} from 'react';
import './CreateClassWork.css';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFileAlt, faTable, faSort, faPlus, faAlignLeft} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Input} from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../../Auth/MyTextInput';
import {createQuiz} from '../../../../redux/actionCreators';
import {connect} from 'react-redux';

const mapStateToProps = state => {
    return {
        userId: state.userId
    }
}

const mapDispatchToProps = dispatch => {
    return {
        createQuiz: quiz_data => dispatch(createQuiz(quiz_data))
    }
}

class CreateClassWork extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            dropdownOpen: false,
            quizModalOpen: false,
            addQuizModalOpen: false,
            title: '',
            instruction: '',
            quizQuestions: [],
            dueDate: '',
        }
    }

    onCreateClassClick = e => {
        e.preventDefault();
        // console.log(e.target.value);
        switch(e.target.value) {
            case 'Assignment':
                // console.log('Assignment');
                break;
            case 'Quiz':
                // console.log('Quiz');
                this.toogleQuizModal();
                break;
            default:
                // console.log('defalult');
                break;
        }
        // alert(e.target.value);
    }

    onEditorStateChange = editorState => {
        this.setState({
            editorState,
        });
    };

    onTitleInputChange = e => {
        // console.log(e.target.value);
        this.setState({
            title: e.target.value
        });
    }

    onDueDateInputChange = e => {
        // console.log(e.target.value);
        this.setState({
            dueDate: e.target.value
        });
    }

    onQuizSubmitClick = clsId => {
        // console.log(this.state.title, this.state.quizQuestions, this.state.dueDate, clsId);
        const quiz_data = {
            title: this.state.title,
            instruction: this.state.instruction,
            quiz_questions: this.state.quizQuestions,
            dueDate: this.state.dueDate,
            author_id: this.props.userId,
            class_id: clsId
        }
        this.props.createQuiz(quiz_data);
    }

    toogle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        })
    }

    toogleQuizModal = () => {
        this.setState({
            quizModalOpen: !this.state.quizModalOpen
        })
    }
    
    toogleAddQuizModal = () => {
        this.setState({
            addQuizModalOpen: !this.state.addQuizModalOpen
        })
    }

    render() {
        // let quizQuestion = [];
        // console.log(this.state.quizQuestions);
        const {clsId} = this.props;
        
        // console.log(clsId);
        
        let uiQuizQuestions = this.state.quizQuestions.map((question, idx) => {
            return (
                <li key={`quizquestion-${idx}`}>
                    <h3>{question.question}</h3>
                    <div>
                        <input type="radio" name={idx} id={`question-${idx}-answers-1`} value="option1" />
                        <label htmlFor={`question-${idx}-answers-1`}>&nbsp;{question.option1}</label>
                    </div>

                    <div>
                        <input type="radio" name={idx} id={`question-${idx}-answers-2`} value="option2" />
                        <label htmlFor={`question-${idx}-answers-2`}>&nbsp;{question.option2}</label>
                    </div>

                    <div>
                        <input type="radio" name={idx} id={`question-${idx}-answers-3`} value="option3" />
                        <label htmlFor={`question-${idx}-answers-3`}>&nbsp;{question.option3}</label>
                    </div>

                    <div>
                        <input type="radio" name={idx} id={`question-${idx}-answers-4`} value="option4" />
                        <label htmlFor={`question-${idx}-answers-4`}>&nbsp;{question.option4}</label>
                    </div>
                    <div>
                        <label htmlFor={`question-${idx}-answers-4`}>Correct answer: {question.answer}</label>
                    </div>
                </li>
            )
        });
        // console.log(uiQuizQuestions);
        return (
            <div>
                <ButtonDropdown className="mb-3" isOpen={this.state.dropdownOpen} toggle={this.toogle}>
                    <DropdownToggle>
                        <FontAwesomeIcon icon={faPlus} className="mr-3" />
                        Create
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this.onCreateClassClick} value="Assignment">Assignment</DropdownItem>
                        <DropdownItem onClick={this.onCreateClassClick} value="Quiz">Quiz</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

                <div className="class-work-info">
                    <p>Assign work to your class here</p>
                    {/* <a href='https://forms.gle/fUoccpHrJC4frYge9'>Go there for exam</a> */}
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

                {/* quiz modal */}
                <Modal isOpen={this.state.quizModalOpen} contentClassName="my-custom-modal" toggle={this.toogleQuizModal} className='my-modal-dialog'>
                    <ModalHeader toggle={this.toogleQuizModal}>Create a quiz</ModalHeader>
                    <ModalBody>
                        <div className="d-flex">
                            <div className="quiz-left-container border-right">
                                <div className="quiz-des mr-2">
                                    {/* title */}
                                    <div className="quiz-title d-flex mb-3">
                                        <FontAwesomeIcon icon={faFileAlt} className="mr-3" />
                                        <Input placeholder="title" name="title" onChange={this.onTitleInputChange} />
                                    </div>

                                    {/* instruction */}
                                    <div className="quiz-instruction d-flex mb-3">
                                        <FontAwesomeIcon icon={faAlignLeft} className="mr-3" />
                                        <div className="quiz-input-container">
                                            <Editor
                                                editorState={this.state.editorState}
                                                onEditorStateChange={this.onEditorStateChange}
                                                placeholder="Instructions(optional)"
                                                editorStyle={{marginLeft: '5px'}}
                                            />
                                        </div> 
                                    </div>

                                    {/* add question */}
                                    <Button className="float-right" onClick={this.toogleAddQuizModal}>
                                        <FontAwesomeIcon icon={faPlus} className="mr-3" />
                                        Add question
                                    </Button>
                                    <Modal isOpen={this.state.addQuizModalOpen} toggle={this.toogleAddQuizModal}>
                                        <ModalHeader toggle={this.toogleAddQuizModal}>Write your question here!</ModalHeader>
                                        <ModalBody>
                                            <Formik
                                                initialValues={{
                                                    question: '',
                                                    option1: '',
                                                    option2: '',
                                                    option3: '',
                                                    option4: '',
                                                    answer: 'option1',
                                                }}
                                                validationSchema={Yup.object({
                                                    question: Yup.string()
                                                                .required('Required'),
                                                    option1: Yup.string()
                                                                .required('Required'),
                                                    option2: Yup.string()
                                                                .required('Required'),
                                                    option3: Yup.string()
                                                                .required('Required'),
                                                    option4: Yup.string()
                                                                .required('Required'),
                                                })}
                                                onSubmit={(values, { setSubmitting }) => {
                                                    // this.props.auth(values);
                                                    this.state.quizQuestions.push(values);

                                                    setTimeout(() => {
                                                        // alert(JSON.stringify(values, null, 2));
                                                        this.toogleAddQuizModal();
                                                        setSubmitting(false);
                                                    }, 400);
                                                }}
                                            >
                                                <Form>
                                                    <MyTextInput
                                                        label="Question"
                                                        name="question"
                                                        type="text"
                                                    />
                                                    <MyTextInput
                                                        label="Option 1"
                                                        name="option1"
                                                        type="text"
                                                    />
                                                    <MyTextInput
                                                        label="Option 2"
                                                        name="option2"
                                                        type="text"
                                                    />
                                                    <MyTextInput
                                                        label="Option 3"
                                                        name="option3"
                                                        type="text"
                                                    />
                                                    <MyTextInput
                                                        label="Option 4"
                                                        name="option4"
                                                        type="text"
                                                    />
                                                    <Field as="select" name="answer" className="form-control mb-3">
                                                        <option value="option1">Option 1</option>
                                                        <option value="option2">Option 2</option>
                                                        <option value="option3">Option 3</option>
                                                        <option value="option4">Option 4</option>
                                                    </Field>
                                                    <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                                                </Form>
                                            </Formik>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="primary" onClick={this.toogleAddQuizModal}>Do Something</Button>{' '}
                                            <Button color="secondary" onClick={this.toogleAddQuizModal}>Cancel</Button>
                                        </ModalFooter>
                                    </Modal>
                                    <br /><br /><br />
                                    <div className="quiz-questions" id="quiz">
                                        {uiQuizQuestions.length === 0 && <h3>You've not added any question yet! Please add question!</h3>}
                                        <ol>
                                            {uiQuizQuestions}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div className="quiz-right-container">
                                <div className="form-group">
                                    <label>Due Date</label><label style={{color: "red"}}>&nbsp;*</label>
                                    <input type="datetime-local" name="bday" className="form-control" onChange={this.onDueDateInputChange} />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.onQuizSubmitClick(clsId)} disabled={this.state.title === '' ? true : false}>Submit</Button>{' '}
                        <Button color="secondary" onClick={this.toogleQuizModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateClassWork);