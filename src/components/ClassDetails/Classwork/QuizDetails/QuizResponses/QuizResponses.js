import React, {useState, useEffect} from 'react';
import './QuizResponses.css';
import {connect} from 'react-redux';
import {fetchQuizResponses} from '../../../../../redux/actionCreators';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {faHandPointUp} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

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

    console.log(props.quizResponses);


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
                <Modal isOpen={responseModalOpen} contentClassName="my-custom-modal" toggle={toogleResponseModal} className='my-modal-dialog'>
                <ModalHeader toggle={toogleResponseModal} className="text-success">{selectedUser}'s response</ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        <h3 className="text-success">Total correct: {selectedUserResponse.total_correct}</h3>
                        <h3 className="text-danger">Total wrong: {selectedUserResponse.total_wrong}</h3>
                        <p className="m-0">------------------------------------------</p>
                        <h3 className="text-primary">Score total: {selectedUserResponse.total_correct}</h3>
                    </div>
                    
                    <ol>
                        {/* question.answer === "option1" ? selectedUserResponse[idx] === question.answer ? "green": "red" : '' */}
                        {quiz_questions.map((question, idx) => {
                            // console.log(idx, selectedUserResponse);

                            return <li key={`quizquestion-${idx}`} className="card mt-2 p-3" style={{backgroundColor: '#fac66b'}}>
                                <h3 className="card-title text-dark font-weight-bold">{idx+1}. {question.question}</h3>
                                <div style={{display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: selectedUser && selectedUserResponse?.user_answer[idx] === 'option1'? selectedUserResponse.user_answer[idx] === question.answer ? "#66BB6A": "#C62828" : ''}}>
                                    <input disabled type="radio" name={idx} id={`question-${idx}-answers-1`} value="option1" />
                                    <label htmlFor={`question-${idx}-answers-1`} style={{margin: 0}}>&nbsp;{question.option1}</label>
                                </div>
                
                                <div style={{display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: selectedUser && selectedUserResponse?.user_answer[idx] === 'option2'? selectedUserResponse.user_answer[idx] === question.answer ? "#66BB6A": "#C62828" : ''}}>
                                    <input disabled type="radio" name={idx} id={`question-${idx}-answers-2`} value="option2" />
                                    <label htmlFor={`question-${idx}-answers-2`} style={{margin: 0}}>&nbsp;{question.option2}</label>
                                </div>
                
                                <div style={{display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: selectedUser && selectedUserResponse?.user_answer[idx] === 'option3'? selectedUserResponse.user_answer[idx] === question.answer ? "#66BB6A": "#C62828" : ''}}>
                                    <input disabled type="radio" name={idx} id={`question-${idx}-answers-3`} value="option3" />
                                    <label htmlFor={`question-${idx}-answers-3`} style={{margin: 0}}>&nbsp;{question.option3}</label>
                                </div>
                
                                <div style={{display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: selectedUser && selectedUserResponse?.user_answer[idx] === 'option4'? selectedUserResponse.user_answer[idx] === question.answer ? "#66BB6A": "#C62828" : ''}}>
                                    <input disabled type="radio" name={idx} id={`question-${idx}-answers-4`} value="option4" />
                                    <label htmlFor={`question-${idx}-answers-4`} style={{margin: 0}}>&nbsp;{question.option4}</label>
                                </div>
                                <div>
                                    <label htmlFor={`question-${idx}-answers-4`} className="font-weight-bold">Correct answer: {question.answer}</label>
                                </div>
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