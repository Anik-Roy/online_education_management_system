import React, {Component} from 'react';
import './CreateClassWork.css';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFileAlt, faPlus, faAlignLeft} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Input, Spinner, Alert} from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../../Auth/MyTextInput';
import {createQuiz, createAssignment} from '../../../../redux/actionCreators';
import {connect} from 'react-redux';
import { firebase, storage } from '../../../../firebase';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        createQuizLoading: state.createQuizLoading,
        createAssignmentLoading: state.createAssignmentLoading,
        createQuizSuccessMsg: state.createQuizSuccessMsg,
        createQuizErrorMsg: state.createQuizErrorMsg,
        createAssignmentSuccessMsg: state.createAssignmentSuccessMsg,
        createAssignmentErrorMsg: state.createAssignmentErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        createQuiz: quiz_data => dispatch(createQuiz(quiz_data)),
        createAssignment: assignment_data => dispatch(createAssignment(assignment_data))
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
            examType: '',
            assignmentFile: null
        }
    }

    onCreateClassClick = e => {
        e.preventDefault();
        // console.log(e.target.value);
        switch(e.target.value) {
            case 'Assignment':
                // console.log('Assignment');
                this.setState({
                    examType: 'Assignment'
                });
                this.toogleQuizModal();
                break;
            case 'Quiz':
                // console.log('Quiz');
                this.setState({
                    examType: 'Quiz'
                });
                this.toogleQuizModal();
                break;
            default:
                // console.log('defalult');
                break;
        }
    }

    onEditorStateChange = editorState => {
        this.setState({
            editorState,
            instruction: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
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

    handleAssignmentFile = e => {
        // console.log(e.target.files[0].type);
        if(e.target.files);

        if(e.target.files[0]?.type === 'application/pdf') {
            this.setState({
                assignmentFile: e.target.files[0]
            });
        } else {
            alert('The file must be in pdf format!');
            document.getElementById('assignment-file-input').value = '';
        }
        return null;
    }

    onQuizSubmitClick = async clsId => {
        if(this.state.examType === 'Assignment') {
            await new Promise((resolve, reject) => {
                let storageRef = storage.ref();
                let folderRef = storageRef.child(`${clsId}/assignment`);
    
                let file = this.state.assignmentFile;
                let {name, type} = file;
    
                let uploadTask = folderRef.child(name).put(file);
    
                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(progress);
    
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                // console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                // console.log('Upload is running');
                                break;
                            default:
                                // console.log('default case');
                                break;
                        }
                    },
                    (error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        console.log(error.code);
                        reject(error.code);
                    },
                    () => {
                        // Upload completed successfully, now we can get the download URL
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            // console.log('File available at', downloadURL);
                            const assignment_data = {
                                title: this.state.title,
                                instruction: this.state.instruction,
                                assignmentFileUrl: downloadURL,
                                name,
                                type,
                                dueDate: this.state.dueDate,
                                author_id: this.props.userId,
                                class_id: clsId
                            }
                            this.props.createAssignment(assignment_data);
                            resolve();
                        });
                    }
                );
            });
        } else if(this.state.examType === 'Quiz') {
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
        this.setState({
            quizModalOpen: false
        });
    }

    toogle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        })
    }

    toogleQuizModal = (flag='open') => {
        this.setState({
            quizModalOpen: !this.state.quizModalOpen,
        });
        if(flag === 'close') {
            this.setState({
                title: '',
                instruction: '',
                quizQuestions: [],
                dueDate: '',
                examType: '',
                assignmentFile: null
            });
        }
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
                {this.props.createAssignmentLoading && <Spinner color="success" />}
                {this.props.createQuizLoading && <Spinner color="success" />}
                {this.props.createAssignmentSuccessMsg && <Alert color="primary">{this.props.createAssignmentSuccessMsg}</Alert>}
                {this.props.createAssignmentErrorMsg && <Alert color="primary">{this.props.createAssignmentErrorMsg}</Alert>}
                {this.props.createQuizSuccessMsg && <Alert color="primary">{this.props.createQuizSuccessMsg}</Alert>}
                {this.props.createQuizErrorMsg && <Alert color="primary">{this.props.createQuizErrorMsg}</Alert>}
                
                {/* quiz modal */}
                <Modal isOpen={this.state.quizModalOpen} contentClassName="my-custom-modal" toggle={() => this.toogleQuizModal('close')} className='my-modal-dialog'>
                    <ModalHeader toggle={() => this.toogleQuizModal('close')}>Create a {this.state.examType}</ModalHeader>
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
                                        Add assignment/quiz
                                    </Button>
                                    <Modal isOpen={this.state.addQuizModalOpen} toggle={this.toogleAddQuizModal}>
                                        <ModalHeader toggle={this.toogleAddQuizModal}>{this.state.examType}</ModalHeader>
                                        <ModalBody>
                                            {/* quiz form */}
                                            {this.state.examType==='Quiz' && 
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
                                            }
                                            
                                            {/* assignment form */}
                                            {
                                                this.state.examType === 'Assignment' && 
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        id="assignment-file-input"
                                                        label="Select assignment(supported file type: pdf/docs)"
                                                        name="question"
                                                        type="file"
                                                        onChange={this.handleAssignmentFile}
                                                    />

                                                    <button className="btn btn-sm btn-primary mt-2 mr-3" onClick={this.toogleAddQuizModal}>Done</button>
                                                </div>
                                            }
                                        </ModalBody>
                                    </Modal>
                                    <br /><br /><br />
                                    <div className="quiz-questions" id="quiz">
                                        {(uiQuizQuestions.length === 0 && this.state.assignmentFile === null) && <h3>You've not added any question/assignment yet! Please add question/assignment.</h3>}
                                        {this.state.assignmentFile && <h3>Assignment file: {this.state.assignmentFile.name}</h3>}
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
                        {/* {console.log(uiQuizQuestions.length)} */}
                        <Button color="primary" onClick={() => this.onQuizSubmitClick(clsId)} disabled={this.state.title === '' || (uiQuizQuestions.length === 0 && this.state.assignmentFile === null) ? true : false}>Submit</Button>{' '}
                        <Button color="secondary" onClick={() => this.toogleQuizModal('close')}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateClassWork);