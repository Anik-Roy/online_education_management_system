import React, {Component} from 'react';
import './CreateClassWork.css';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFileAlt, faPlus, faAlignLeft, faCheck} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Spinner, Alert} from 'reactstrap';
import DateTimePicker from 'react-datetime-picker';
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
            questionOptions: [],
            initialValues: {question: "", answer: "", descriptiveQuestion: false, marks: "1", optionsLength: 0},
            errors: {},
            title: '',
            instruction: '',
            assignmentMarks: '',
            quizQuestions: [],
            quizQuestionDescriptive: false,
            startingDate: '',
            dueDate: '',
            acceptingQuiz: 'off',
            examType: '',
            assignmentFile: null,
            assignmentLink: "",
            progress: 0,
            fileUploading: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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

    onStartDateInputChange = value => {
        // console.log(e.target.value);
        // this.setState({
        //     startingDate: e.target.value
        // });
        console.log(value);
        this.setState({
            startingDate: value
        });
    }

    onDueDateInputChange = value => {
        // console.log(e.target.value);
        // this.setState({
        //     dueDate: e.target.value
        // });
        console.log(value);
        this.setState({
            dueDate: value
        });
    }

    onSubmissionAcceptingChange = e => {
        // console.log('quiz accepting button change!');
        console.log(e.target.name, e.target.value);
        if(e.target.value === 'on') {
            // console.log('on');
            this.setState({
                acceptingQuiz: 'off'
            })
        } else {
            this.setState({
                acceptingQuiz: 'on'
            })
        }

        setTimeout(() => {
            console.log(this.state.acceptingQuiz);
        }, 3000);
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

    resetState = () => {
        this.setState({
            editorState: EditorState.createEmpty(),
            dropdownOpen: false,
            quizModalOpen: false,
            addQuizModalOpen: false,
            questionOptions: [],
            initialValues: {question: "", answer: "", descriptiveQuestion: false, marks: "1", optionsLength: 0},
            errors: {},
            title: '',
            instruction: '',
            assignmentMarks: '',
            quizQuestions: [],
            quizQuestionDescriptive: false,
            startingDate: '',
            dueDate: '',
            acceptingQuiz: 'off',
            examType: '',
            assignmentFile: null,
            assignmentLink: "",
            progress: 0,
            fileUploading: false
        });
    }

    onQuizSubmitClick = async clsId => {
        if(this.state.examType === 'Assignment') {
            if(this.state.assignmentFile !== null) {
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
                            this.setState({
                                progress,
                                fileUploading: true
                            });

                            if(progress >= 100) {
                                this.setState({
                                    fileUploading: false
                                });
                            }
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
                                    assignmentMarks: this.state.assignmentMarks,
                                    name,
                                    type,
                                    startingDate: this.state.startingDate,
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
            } else if(this.state.assignmentLink !== "") {
                const assignment_data = {
                    title: this.state.title,
                    instruction: this.state.instruction,
                    assignmentLink: this.state.assignmentLink,
                    assignmentMarks: this.state.assignmentMarks,
                    name: '',
                    type: 'link',
                    startingDate: this.state.startingDate,
                    dueDate: this.state.dueDate,
                    author_id: this.props.userId,
                    class_id: clsId
                }
                this.props.createAssignment(assignment_data);
            }
        } else if(this.state.examType === 'Quiz') {
            console.log(this.state.quizQuestions);
            const quiz_data = {
                title: this.state.title,
                instruction: this.state.instruction,
                // quizQuestionDescriptive: this.state.quizQuestionDescriptive,
                quiz_questions: this.state.quizQuestions,
                startingDate: this.state.startingDate,
                dueDate: this.state.dueDate,
                acceptingQuiz: this.state.acceptingQuiz,
                author_id: this.props.userId,
                class_id: clsId
            }
            this.props.createQuiz(quiz_data);
        }

        this.resetState();

        // this.setState({
        //     quizModalOpen: false,
        //     title: '',
        //     instruction: '',
        //     quizQuestions: [],
        //     quizQuestionDescriptive: false,
        //     dueDate: '',
        //     examType: '',
        //     assignmentFile: null
        // });
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
            // this.setState({
            //     title: '',
            //     instruction: '',
            //     quizQuestions: [],
            //     dueDate: '',
            //     examType: '',
            //     assignmentFile: null
            // });
            this.resetState();
        }
    }
    
    toogleAddQuizModal = () => {
        this.setState({
            addQuizModalOpen: !this.state.addQuizModalOpen,
            initialValues: {question: "", answer: "", descriptiveQuestion: false, marks: "1", optionsLength: 0},
            questionOptions: []
        });
    }

    addOption = () => {
        const key = "option"+(this.state.questionOptions.length+1);
        let tmpOptions = [...this.state.questionOptions];
        tmpOptions.push(<FormGroup key={key}>
            <Label htmlFor={key}>Option {this.state.questionOptions.length+1}</Label>
            <Input
                label={"Option "+this.state.questionOptions.length+1}
                name={key}
                type="text"
                required
                onChange={this.handleChange}
            />
        </FormGroup>)

        let initialValues = {...this.state.initialValues, [key]: "", optionsLength: tmpOptions.length};

        this.setState({
            questionOptions: tmpOptions,
            initialValues: initialValues
        });
    }

    removeOption = () => {
        const key = "option"+(this.state.questionOptions.length);
        let tmpOptions = [...this.state.questionOptions];
        tmpOptions.splice(-1, 1);

        let initialValues = {...this.state.initialValues, optionsLength: tmpOptions.length};

        delete initialValues[key];

        let errors = {...this.state.errors};
        // console.log('before delete > errors > ', errors);
        if(errors[key]) {
            delete errors[key];
            // console.log('after delete > errors > ', errors);
        }

        this.setState({
            questionOptions: tmpOptions,
            initialValues: initialValues,
            errors
        });
    }

    handleChange = e => {
        if(e.target.name === "assignmentLink") {
            this.setState({
                [e.target.name]: e.target.value
            });
            return;
        }

        if(e.target.name === "quizQuestionDescriptive") {
            console.log(e.target.name, e.target.checked);

            let initialValues = {...this.state.initialValues, descriptiveQuestion: e.target.checked}
            let tmpOptions = [...this.state.questionOptions];

            if(e.target.checked) {
                tmpOptions = [];
                initialValues['optionsLength'] = 0;
            }

            this.setState({
                [e.target.name]: e.target.checked,
                initialValues: initialValues,
                questionOptions: tmpOptions
            });
            return;
        }

        if(e.target.name === "marks") {
            console.log(e.target.name, e.target.value);
            let initialValues = {...this.state.initialValues, [e.target.name]: e.target.value}
            this.setState({
                initialValues: initialValues
            });
            return;
        }

        if(e.target.name === "assignmentMarks") {
            this.setState({
                assignmentMarks: e.target.value
            });
            return;
        }

        let initialValues = {...this.state.initialValues, [e.target.name]: e.target.value, descriptiveQuestion: false}
        this.setState({
            initialValues: initialValues
        });
    }

    handleSubmit = e => {
        e.preventDefault();
        console.log(this.state.initialValues);
        
        let initialValues = {...this.state.initialValues};
        let quizQuestions = [...this.state.quizQuestions, initialValues];
        console.log(quizQuestions);
        this.setState({
            quizQuestions,
        });

        setTimeout(() => {
            this.setState({
                initialValues: {question: "", answer: "", descriptiveQuestion: false, optionsLength: 0},
                questionOptions: [],
                quizQuestionDescriptive: false
            })
        }, 1000);
        
        this.toogleAddQuizModal();
    }

    handleAssignmentInfoSubmit = e => {
        e.preventDefault();
        this.toogleAddQuizModal();
    }

    render() {
        const {clsId} = this.props;

        let startingDate = new Date(this.state.startingDate);
        let dueDate = new Date(this.state.dueDate);
        let errorDateSetting = "";

        if(dueDate < startingDate) {
            errorDateSetting = "Due date cann't be earlier than starting date.";
        }

        let uiQuizQuestions = this.state.quizQuestions.map((question, idx) => {
            return (
                <li key={`quizquestion-${idx}`} className="card mt-2 p-3">
                    <h3 className="card-title text-dark font-weight-bold">{idx+1}.&nbsp;{question.question}<span className="ml-2 text-info">{`Marks: ${question.marks}`}</span></h3>
                    {/* {question.descriptiveQuestion? "descriptive > true" : "descriptive > false"} */}
                    {/* {question.descriptiveQuestion ? `${question.marks}` : "mark is 1"} */}
                    {
                        [...Array(question.optionsLength).keys()].map(x => (
                            <div style={{display: 'flex', alignItems: 'center', padding: '10px'}} key={`question-${idx}-option-${x}`}>
                                <input type="radio" name={idx} id={`question-${idx}-answers-${x}`} value={`option${x+1}`} />
                                <label className="m-0" htmlFor={`question-${idx}-answers-${x}`}>&nbsp;{question[`option${x+1}`]}</label>
                                {`option${x+1}` === question.answer && <FontAwesomeIcon icon={faCheck} className="quiz-response-icon text-success ml-2" />}
                            </div>
                        ))
                    }
                    {/* {console.log(question.optionsLength)} */}
                    {/* {!question.descriptiveQuestion && <div>
                        <label htmlFor={`question-${idx}-answers-4`}>Correct answer: {question.answer}</label>
                    </div>} */}
                </li>
            )
        });
        
        // console.log('exam type > ', this.state.examType === 'Assignment', 'create loading > ', this.props.createAssignmentLoading);

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
                                    <Button outline color="success" className="success float-right" onClick={this.toogleAddQuizModal}>
                                        <FontAwesomeIcon icon={faPlus} className="mr-3" />
                                        Add assignment/quiz
                                    </Button>
                                    <Modal isOpen={this.state.addQuizModalOpen} toggle={this.toogleAddQuizModal}>
                                        <ModalHeader toggle={this.toogleAddQuizModal}>{this.state.examType}</ModalHeader>
                                        <ModalBody>
                                            {/* quiz form */}
                                            {/* {console.log(this.state.initialValues)} */}
                                            {this.state.examType==='Quiz' && 
                                                <form onSubmit={this.handleSubmit}>
                                                    <FormGroup>
                                                        <Label htmlFor="question">Question</Label>
                                                        <Input invalid={this.state.errors.question ? true : false} required type="text" name="question" onChange={this.handleChange} />
                                                    </FormGroup>

                                                    {this.state.questionOptions.map((option, idx) => (<div key={'question-option-'+idx}>{option}</div>))}
                                                    
                                                    <div className="descriptive-question">
                                                        <FormGroup check>
                                                            <Label check>
                                                            <Input type="checkbox" name="quizQuestionDescriptive" onChange={this.handleChange} />{' '}
                                                                Descriptive Question?
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    {/* {console.log(this.state.quizQuestionDescriptive)} */}
                                                    {!this.state.quizQuestionDescriptive && <div className="d-flex justify-content-end">
                                                        {this.state.questionOptions.length > 0 && <Button outline color="warning" onClick={e => this.removeOption()}>Remove option</Button>}&nbsp;
                                                        <Button outline color="primary" onClick={e => this.addOption()}>Add option</Button>
                                                    </div>}
                                                    <div>
                                                        <FormGroup>
                                                            <Label htmlFor="marks">Marks</Label>
                                                            <Input name="marks" type="number" min="1" step="0.01" required onChange={this.handleChange} />
                                                        </FormGroup>
                                                    </div>
                                                    {/* <br /><br /> */}
                                                    {!this.state.quizQuestionDescriptive && <FormGroup>
                                                        <Label htmlFor="answer">Answer</Label>
                                                        <Input invalid={this.state.errors.answer ? true : false} required type="select" name="answer" onChange={this.handleChange}>
                                                        <option key={'option'} value="">__SELECT_ANSWER__</option>
                                                           {this.state.questionOptions.map((option, idx) => <option key={'option-'+idx} value={`option${idx+1}`}>Option {idx+1}</option>)}
                                                        </Input>
                                                    </FormGroup>}
                                                    <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                                                </form>
                                            }
                                            
                                            {/* assignment form */}
                                            {
                                                this.state.examType === 'Assignment' &&
                                                <form onSubmit={this.handleAssignmentInfoSubmit}>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            id="assignment-file-input"
                                                            label="Select assignment(supported file type: pdf/docs)"
                                                            name="question"
                                                            type="file"
                                                            onChange={this.handleAssignmentFile}
                                                        />
                                                        <br/>or give your assignment link<br/>
                                                        <input
                                                            className="form-control"
                                                            id="assignment-file-link"
                                                            label="Assignment link"
                                                            type="text"
                                                            name="assignmentLink"
                                                            onChange={this.handleChange}
                                                        />
                                                        <div>
                                                            <FormGroup>
                                                                <Label htmlFor="marks">Marks</Label>
                                                                <Input name="assignmentMarks" type="number" min="1" step="0.01" required onChange={this.handleChange} />
                                                            </FormGroup>
                                                        </div>
                                                        <button className="btn btn-sm btn-primary mt-2 mr-3">Done</button>
                                                    </div>
                                                </form>
                                            }
                                        </ModalBody>
                                    </Modal>
                                    <br /><br /><br />
                                    <div className="quiz-questions" id="quiz">
                                        {this.state.title === '' && <Alert color="danger">Please give a {this.state.examType.toLowerCase()} title.</Alert>}
                                        {this.state.startingDate === '' && <Alert color="danger">Please select starting date.</Alert>}
                                        {this.state.examType === "Assignment" && this.state.dueDate === '' && <Alert color="danger">Please select due date.</Alert>}
                                        {this.state.examType === "Assignment" && this.state.assignmentMarks === '' && <Alert color="danger">Please enter marks for this assignment.</Alert>}
                                        {(this.state.examType === "Quiz" && uiQuizQuestions.length === 0) && <Alert color="danger">You've not added any question yet! Please add question.</Alert>}
                                        {this.state.examType === "Assignment" && this.state.assignmentFile === null && this.state.assignmentLink === "" && <Alert color="danger">Please choose assignment file or link.</Alert>}
                                        {errorDateSetting !== "" && <Alert className="mt-2" color="danger">{errorDateSetting}</Alert>}
                                        {this.state.assignmentFile && <h3 className="text-success">Assignment file: {this.state.assignmentFile.name}</h3>}
                                        {this.state.assignmentLink && <h3 className="text-success">Assignment link: <a href={this.state.assignmentLink}>{this.state.assignmentLink}</a></h3>}
                                        <br/>
                                        {this.state.examType === "Assignment" && this.state.assignmentMarks !== "" && <h3 className="text-success">Assignment marks: {this.state.assignmentMarks}</h3>}
                                        <ol>
                                            {uiQuizQuestions}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div className="quiz-right-container">
                                {<div className="form-group">
                                    <label>Starting Date</label><label style={{color: "red"}}>&nbsp;*</label>
                                    <br/>
                                    {/* <input type="datetime-local" step="60" name="startingDate" className="form-control" onChange={this.onStartDateInputChange} /> */}
                                    <DateTimePicker onChange={value => this.onStartDateInputChange(value)} value={this.state.startingDate} />
                                </div>}
                                {this.state.examType === 'Assignment' && <div className="form-group">
                                    <label>Due Date</label><label style={{color: "red"}}>&nbsp;*</label>
                                    <br/>
                                    {/* <input type="datetime-local" step="60" name="dueDate" className="form-control" onChange={this.onDueDateInputChange} /> */}
                                    <DateTimePicker onChange={value => this.onDueDateInputChange(value)} value={this.state.dueDate} />
                                </div>}
                                {this.state.examType === 'Quiz' && <div className="d-flex justify-items-center">
                                    <b>{this.state.acceptingQuiz === "on" ? "Accepting responses" : "Not accepting responses"}</b>
                                    <input style={{display:"none"}} type="checkbox" id="acceptingQuiz" name="acceptingQuiz" value={this.state.acceptingQuiz} onChange={this.onSubmissionAcceptingChange} />
                                    <label htmlFor="acceptingQuiz" className="toggle"><span></span></label>    
                                </div>}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {/* {console.log(this.state.examType === 'Assignment' && this.state.assignmentFile === null && this.state.assignmentLink === "")} */}
                        {console.log(this.state)}
                        <Button color="primary" onClick={() => this.onQuizSubmitClick(clsId)} disabled={this.state.title === '' || this.state.startingDate === '' || (this.state.examType === 'Assignment' && this.state.dueDate === '') || errorDateSetting !== "" || (this.state.examType === 'Assignment' && this.state.assignmentMarks === '') || (this.state.examType === 'Quiz' && uiQuizQuestions.length === 0) || (this.state.examType === 'Assignment' && this.state.assignmentFile === null && this.state.assignmentLink === "") || ((this.state.examType === 'Assignment' && this.props.createAssignmentLoading) || this.state.fileUploading) || (this.state.examType === 'Quiz' && this.props.createQuizLoading) ? true : false}>Submit</Button>{' '}
                        {this.state.fileUploading && <Spinner color="success" />}
                        <Button color="secondary" onClick={() => this.toogleQuizModal('close')}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateClassWork);