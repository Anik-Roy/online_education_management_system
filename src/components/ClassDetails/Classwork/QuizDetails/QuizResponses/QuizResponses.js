import React, {useState, useEffect} from 'react';
import './QuizResponses.css';
import {connect} from 'react-redux';
import {fetchQuizResponses} from '../../../../../redux/actionCreators';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Toast, ToastHeader, ToastBody } from 'reactstrap';
import {faHandPointUp, faCheck, faTimes, faSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { CSVLink } from "react-csv";
import axios from 'axios';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        quizResponses: state.quizResponses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchQuizResponses: quiz_id => dispatch(fetchQuizResponses(quiz_id))
    }
}

const QuizResponses = props => {
    const {quizId, fetchQuizResponses} = props;
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserResponse, setSelectedUserResponse] = useState([]);
    const [marks, setMarks] = useState({id: null, value: ''});
    const [showToast, setShowToast] = useState({id: null, value: false});
    const [show, setShow] = useState(false);
    // const {quiz_questions} = props.quizDetails.data;
    const [quiz_questions, setQuizQuestions] = useState([]);

    useEffect(() => {
        fetchQuizResponses(quizId);
        axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/quizes/${quizId}.json`)
            .then(response => {
                console.log(response.data);
                setQuizQuestions(response.data.quiz_questions);
            })
            .catch(error => {
                console.log(error);
            });
    }, [fetchQuizResponses, quizId]);

    const toogleResponseModal = () => {
        setResponseModalOpen(!responseModalOpen);
    }

    const onShowResponseClick = (userId, user_response) => {
        setSelectedUser(userId);
        setSelectedUserResponse(user_response);
    }

    const handleChange = (e, idx) => {
        if(e.target.name === 'marks') {
            setMarks({id: idx, value: `${e.target.value}`});
            console.log(e.target.value);
        }
    }

    const updateMark = (e, idx) => {
        e.preventDefault();
        let tempSelectedUserResponse = {...selectedUserResponse};
        tempSelectedUserResponse.user_answer[idx].marks = marks.value;
        let response_id = tempSelectedUserResponse['key'];
        let user_profile = tempSelectedUserResponse['userProfile'];

        delete tempSelectedUserResponse['key'];
        delete tempSelectedUserResponse['userProfile'];
        console.log(tempSelectedUserResponse);
        axios.patch(`https://sust-online-learning-default-rtdb.firebaseio.com/quiz_responses/${selectedUserResponse.key}.json`, tempSelectedUserResponse)
            .then(response => {
                console.log(response);
                console.log(document.getElementById(`marks${idx}`));
                document.getElementById(`marks${idx}`).value = "";
                setSelectedUserResponse({...tempSelectedUserResponse, key: response_id, userProfile: user_profile});
                setShowToast({id: idx, value: true});
                setShow(true);

                setTimeout(() => {
                    setShowToast({id: null, value: false})
                    setShow(false);
                }, 3000);
            })
            .catch(error => {
                console.log(error);
            });
        // console.log(tempSelectedUserResponse);
    }

    let headers = [
        { label: "Email", key: "email" },
        { label: "Full Name", key: "fullName" },
        { label: "Student Id", key: "universityId" },
        { label: "Mobile no", key: "mobileNo" },
        { label: "Obtained marks", key: "total_marks"},
        { label: "Total marks in MCQ", key: "total_marks_in_mcq" },
        // { label: "Total MCQ wrong", key: "total_wrong" }
    ];

    let data = props.quizResponses.map(quiz_response => {
        let total_descriptive_answer_mark = 0;
        quiz_response.user_answer.map((answer, idx) => {
            if(typeof answer === 'object' && answer.marks !== "") {
                total_descriptive_answer_mark += parseFloat(answer.marks);
            }
            return true;
        });
        return {
            email: quiz_response.userProfile.email,
            fullName: quiz_response.userProfile.fullName,
            universityId: quiz_response.userProfile.universityId,
            mobileNo: quiz_response.userProfile.mobileNo,
            total_marks: total_descriptive_answer_mark + quiz_response.total_correct,
            total_marks_in_mcq: quiz_response.total_correct,
            // total_wrong: quiz_response.total_wrong
        }
    });

    // console.log(props.quizDetails.data.title);
    let quiz_responses = props.quizResponses.map(quiz_response => {
        console.log('response user id> ', quiz_response.user_id, 'user id > ', props.userId, 'author id > ', props.quizDetails.data.author_id);

        const pendingMarking = [];
        let total_descriptive_answer_mark = 0;
        let cnt = 0;
        quiz_response.user_answer.map((answer, idx) => {
            // console.log(typeof answer);
            if(typeof answer === 'object' && answer.marks === "") {
                pendingMarking.push((<p key={`pending-marking-${quiz_response.key}-${idx}`} className="text-danger" style={{display: 'inline'}}>
                    {cnt > 0 ? `, Q.N-${idx+1}` : `Q.N-${idx+1}`}
                </p>));
                cnt++;
            } else if(typeof answer === 'object') {
                total_descriptive_answer_mark += parseFloat(answer.marks);
            }
            return true;
        });

        // console.log(quiz_response.key);
        if(quiz_response.user_id === props.userId || props.userId === props.quizDetails.data.author_id) {
            return <tr key={quiz_response.key}>
            <th scope="row">{quiz_response.userProfile?.fullName !== "" ?  quiz_response.userProfile?.fullName : quiz_response.userProfile?.email}</th>
            <td>{pendingMarking.length > 0 ? (<span className="text-danger">marking pending</span>): (<span className="text-success">marking completed</span>)}</td>
            <td>{total_descriptive_answer_mark+quiz_response.total_correct}</td>
            <td>{quiz_response.total_correct}</td>
            {/* <td>{quiz_response.total_wrong}</td> */}
            <td>{pendingMarking.length === 0 ? (<span className="text-success">None</span>): pendingMarking}</td>
            <td style={{cursor: 'pointer'}} onClick={() => {onShowResponseClick(quiz_response.user_id, quiz_response); toogleResponseModal();}}><FontAwesomeIcon className="mr-3" style={{color: "black"}} icon={faHandPointUp} />Show response</td>
            </tr>
        } else {
            return null;
        }
    });
    // console.log('hello world!');
    return (
        <div className="quiz-responses-root">
            <div className="quiz-responses">
                <Table bordered className="text-center">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Obtained marks in MCQ</th>
                            {/* <th>Total MCQ wrong</th> */}
                            <th>Pending answer marking</th>
                            <th>User response</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quiz_responses}
                    </tbody>
                </Table>
                {props.userId === props.quizDetails.data.author_id && <CSVLink data={data} headers={headers} filename={props.quizDetails.data.title+".csv"} className="btn btn-outline-secondary">
                    Export as csv
                </CSVLink>}
                <Modal isOpen={responseModalOpen} contentClassName="my-custom-modal" toggle={toogleResponseModal} className='my-modal-dialog'>
                    {/* {console.log(selectedUserResponse.userProfile?.email)} */}
                    <ModalHeader toggle={toogleResponseModal}>email: {selectedUserResponse.userProfile?.email} <br/> student id: {selectedUserResponse?.userProfile?.universityId}</ModalHeader>
                    <ModalBody>
                        <div className="text-center">
                            <div>
                                <h5 style={{fontWeight: "bold"}}>MCQ</h5>
                                <div className="d-flex flex-row justify-content-center">
                                    <div className="quiz-response-icon-div mr-3">
                                        <FontAwesomeIcon icon={faCheck} size="3x" className="text-success" />
                                        <span className="h1">{selectedUserResponse.total_correct}</span>
                                    </div>
                                    <div className="quiz-response-icon-div">
                                        <FontAwesomeIcon icon={faTimes} size="3x" className="text-danger" />
                                        <span className="h1">{selectedUserResponse.total_wrong}</span>
                                    </div>
                                </div>
                            </div>
                            {/* <h3 className="text-success">Total correct: {selectedUserResponse.total_correct}</h3>
                            <h3 className="text-danger">Total wrong: {selectedUserResponse.total_wrong}</h3>
                            <p className="m-0">------------------------------------------</p>
                            <h3 className="text-primary">Score total: {selectedUserResponse.total_correct}</h3> */}
                        </div>
                        
                        <ol>
                            {quiz_questions.map((question, idx) => {
                                return <li key={`quizquestion-${idx}`} className="card mt-2 p-3" style={{backgroundColor: 'white'}}>
                                    <h3 className="card-title text-dark font-weight-bold">
                                        {idx+1}. {question.question}
                                        &nbsp;<span style={{fontSize: "18px"}}>
                                            {question.descriptiveQuestion && selectedUser && selectedUserResponse?.user_answer[idx].marks === "" ? (<span className="text-danger">pending marking...</span>) : question.descriptiveQuestion ? (<span className="text-success">obtained mark : { selectedUser && selectedUserResponse?.user_answer[idx].marks}</span>) : <span className="text-info">Question mark: {`${question.marks}`}</span>}
                                        </span>
                                    </h3>
                                    {/* <p className="border border-success">Marking status: {selectedUser && selectedUserResponse?.user_answer[idx].marks}</p> */}
                                    {question.descriptiveQuestion && <div>
                                            <b>Student answer:</b>
                                            <br/>
                                            <p style={{border: '1px solid #ddd', borderRadius: '5px', padding: '10px'}}>{selectedUser && selectedUserResponse?.user_answer[idx].user_answer}</p>
                                        </div>
                                    }
                                    {question.descriptiveQuestion && props.userId === props.quizDetails.data.author_id && <form onSubmit={e => updateMark(e, idx)}>
                                            <div className="form-group">
                                                {/* <label htmlFor="marks"> Give marks out of {question.marks}</label> */}
                                                <div className="d-flex align-items-center">
                                                    <input className="form-control" style={{width: "200px"}} name="marks" id={`marks${idx}`} type="number" min="0" max={question.marks} step="0.01" placeholder={selectedUser && selectedUserResponse?.user_answer[idx].marks} onChange={e => handleChange(e, idx)} />
                                                    <div style={{transform: "rotateY(0deg) rotate(70deg)"}}>
                                                        <FontAwesomeIcon icon={faSlash} size="2x" />
                                                    </div>
                                                    <span style={{fontSize: "50px"}}>{question.marks}</span>
                                                </div>
                                            </div>
                                            <div style={{display: "flex", alignItems: "center"}}>
                                                {marks.id === idx && marks.value !== "" && <input className="btn btn-outline-success" type="submit" value="Update"/>}
                                                {
                                                    showToast.id === idx && showToast.value &&
                                                        (
                                                            <div className="p-3 my-2 rounded">
                                                                <Toast isOpen={show}>
                                                                    <ToastHeader>
                                                                        Marks updated successfully!
                                                                    </ToastHeader>
                                                                    <ToastBody>
                                                                        New mark {'->'} {selectedUserResponse.user_answer[idx].marks}
                                                                    </ToastBody>
                                                                </Toast>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                        </form>
                                    }
                                    {
                                        [...Array(question.optionsLength).keys()].map(x => {
                                            return <div style={{display: 'flex', alignItems: 'center', padding: '10px'}} key={`question-${idx}-option-${x}`}>
                                                <input disabled type="radio" name={idx} id={`question-${idx}-answers-${x}`} value={`option${x+1}`} />
                                                <label className="m-0" htmlFor={`question-${idx}-answers-${x}`}>&nbsp;{question[`option${x+1}`]}</label>
                                                
                                                {selectedUser && selectedUserResponse?.user_answer[idx] === `option${x+1}` && selectedUserResponse.user_answer[idx] !== question.answer && <FontAwesomeIcon icon={faTimes} className="quiz-response-icon text-danger ml-2 my-0" />}
                                                {`option${x+1}` === question.answer && <FontAwesomeIcon icon={faCheck} className="quiz-response-icon text-success ml-2" />}
                                            </div>
                                        })
                                    }
                                    {/* <div>
                                        <label htmlFor={`question-${idx}-answers-4`} className="font-weight-bold">Correct answer: {question.answer}</label>
                                    </div> */}
                                </li>
                            })}
                        </ol>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toogleResponseModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizResponses);