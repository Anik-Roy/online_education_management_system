import React, {useState, useEffect} from 'react';
import './QuizResponses.css';
import {connect} from 'react-redux';
import {fetchQuizResponses} from '../../../../../redux/actionCreators';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {faHandPointUp, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { CSVLink } from "react-csv";

const mapStateToProps = state => {
    return {
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
    const {quiz_questions} = props.quizDetails.data;

    useEffect(() => {
        fetchQuizResponses(quizId);
    }, [fetchQuizResponses, quizId]);

    const toogleResponseModal = () => {
        setResponseModalOpen(!responseModalOpen);
    }

    const onShowResponseClick = (userId, user_response) => {
        setSelectedUser(userId);
        setSelectedUserResponse(user_response);
    }

    let headers = [
        { label: "Email", key: "email" },
        { label: "Full Name", key: "fullName" },
        { label: "Student Id", key: "universityId" },
        { label: "Mobile no", key: "mobileNo" },
        { label: "Total correct", key: "total_correct" },
        { label: "Total wrong", key: "total_wrong" }
    ];

    let data = props.quizResponses.map(quiz_response => (
        {
            email: quiz_response.userProfile.email,
            fullName: quiz_response.userProfile.fullName,
            universityId: quiz_response.userProfile.universityId,
            mobileNo: quiz_response.userProfile.mobileNo,
            total_correct: quiz_response.total_correct,
            total_wrong: quiz_response.total_wrong
        }
    ));

    console.log(props.quizDetails.data.title);
    let quiz_responses = props.quizResponses.map(quiz_response => (
        <tr key={quiz_response.key}>
          <th scope="row">{quiz_response.userProfile?.fullName !== "" ?  quiz_response.userProfile?.fullName : quiz_response.userProfile?.email}</th>
          <td>{quiz_response.total_correct}</td>
          <td>{quiz_response.total_wrong}</td>
          <td style={{cursor: 'pointer'}} onClick={() => {onShowResponseClick(quiz_response.user_id, quiz_response); toogleResponseModal();}}><FontAwesomeIcon className="mr-3" style={{color: "black"}} icon={faHandPointUp} />Show response</td>
        </tr>
    ))
    return (
        <div className="quiz-responses-root">
            <div className="quiz-responses">
                <Table bordered>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Total correct</th>
                            <th>Total wrong</th>
                            <th>User response</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quiz_responses}
                    </tbody>
                </Table>
                <CSVLink data={data} headers={headers} filename={props.quizDetails.data.title+".csv"} className="btn btn-outline-secondary">
                    Export as csv
                </CSVLink>
                <Modal isOpen={responseModalOpen} contentClassName="my-custom-modal" toggle={toogleResponseModal} className='my-modal-dialog'>
                    {/* {console.log(selectedUserResponse.userProfile?.email)} */}
                    <ModalHeader toggle={toogleResponseModal}>email: {selectedUserResponse.userProfile?.email} <br/> student id: {selectedUserResponse?.userProfile?.universityId}</ModalHeader>
                    <ModalBody>
                        <div className="text-center">
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
                            {/* <h3 className="text-success">Total correct: {selectedUserResponse.total_correct}</h3>
                            <h3 className="text-danger">Total wrong: {selectedUserResponse.total_wrong}</h3>
                            <p className="m-0">------------------------------------------</p>
                            <h3 className="text-primary">Score total: {selectedUserResponse.total_correct}</h3> */}
                        </div>
                        
                        <ol>
                            {quiz_questions.map((question, idx) => {
                                return <li key={`quizquestion-${idx}`} className="card mt-2 p-3" style={{backgroundColor: 'white'}}>
                                    <h3 className="card-title text-dark font-weight-bold">{idx+1}. {question.question}</h3>
                                    
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