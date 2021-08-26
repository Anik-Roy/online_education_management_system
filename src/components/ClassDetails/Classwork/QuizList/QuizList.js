import React, {useState, useEffect} from 'react';
import './QuizList.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {fetchQuizes, fetchQuizResponses} from '../../../../redux/actionCreators';
import {faFileAlt, faTable, faSort, faDownload} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table, Spinner } from 'reactstrap';
import { CSVLink } from "react-csv";
import axios from 'axios';

let _ = require('lodash');

const mapStateToProps = state => {
    return {
        userId: state.userId,
        classQuizes: state.classQuizes,
        quizResponses: state.quizResponses,
        fetchQuizResponsesLoading: state.fetchQuizResponsesLoading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchQuizes: clsId => dispatch(fetchQuizes(clsId)),
        fetchQuizResponses: quiz_id => dispatch(fetchQuizResponses(quiz_id))
    }
}

const QuizList = props => {
    let {classQuizes, clsId} = props;
    let [selectedQuiz, setSelectedQuiz] = useState(null);
    let [userQuizResponses, setUserQuizResponses] = useState([]);

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
    
    let headers = [
        { label: "Email", key: "email" },
        { label: "Full Name", key: "fullName" },
        { label: "Student Id", key: "universityId" },
        { label: "Mobile no", key: "mobileNo" },
        { label: "Obtained marks", key: "total_marks"},
        { label: "Total marks in MCQ", key: "total_marks_in_mcq" },
        // { label: "Total MCQ wrong", key: "total_wrong" }
    ];

    // useEffect(() => {
    //     fetchQuizes(clsId);
    // }, [fetchQuizes, clsId]);
    
    useEffect(() => {
        axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/quiz_responses.json?orderBy="user_id"&equalTo="${props.userId}"`)
            .then(response => {
                // console.log(response);
                let user_responses = [];
                Object.keys(response.data).map(key => {
                    console.log(response.data[key]);
                    user_responses.push({key, ...response.data[key]});
                    return true;
                });
                // console.log(user_responses);
                setUserQuizResponses(user_responses);
            })
            .catch(error => {
                console.log(error);
            })
    }, [props.userId]);

    let sorted_class_quizes = classQuizes.sort((a, b) => {
        return new Date(a.data.dueDate) - new Date(b.data.dueDate);
    });

    let quiz_list = sorted_class_quizes.map((quiz, idx) => {
        let startingDate = new Date(quiz.data.startingDate);
        return (
            <tr key={quiz.key}>
                <th scope="row">{idx+1}</th>
                <td><Link to={{pathname: `/class/${clsId}/${quiz.key}/quiz`, state: { quizDetails: quiz, classTeacher: props.classTeacher }}}>{quiz.data.title}</Link></td>
                {/* <td>{dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}</td> */}
                <td>{startingDate.toLocaleString()}</td>
                <td>{quiz.data.acceptingQuiz}</td>
                {props.userId !== props.classTeacher && <td>
                    {_.find(userQuizResponses, {quiz_id: quiz.key}) ? "submitted" : "not submitted"}
                </td>}
                {props.userId === props.classTeacher && <td>
                    {/* <button className="btn btn-outpine-secondary" onClick={() => console.log(quiz)}>Export as csv</button> */}
                    <FontAwesomeIcon icon={faDownload} style={{fontSize: "18px"}} onClick={() => {setSelectedQuiz(quiz.key); props.fetchQuizResponses(quiz.key)}} />&nbsp;
                    {props.fetchQuizResponsesLoading === true && selectedQuiz === quiz.key && <Spinner color="success" />}
                    {props.fetchQuizResponsesLoading === false && props.quizResponses.length === 0 && selectedQuiz === quiz.key && <span>No response submitted!</span>}
                    {props.fetchQuizResponsesLoading === false && props.quizResponses.length > 0 && selectedQuiz === quiz.key && <CSVLink
                        data={data}
                        headers={headers}
                        filename={quiz.data.title+".csv"}
                        className="btn btn-outline-secondary">
                        Export as csv
                    </CSVLink>}
                </td>}
            </tr>
        );
    });
    
    return (
        <div>
            {quiz_list.length === 0 && (props.userId === props.classTeacher && <div className="class-work-info">
                    <p>Assign work to your class here</p>
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
                </div>)
            }
            <h3>Quiz List</h3>
            <Table className="text-center">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Quiz Title</th>
                        {/* <th>Due Date</th> */}
                        <th>Starting Date</th>
                        <th>Accepting responses status</th>
                        {props.userId !== props.classTeacher && <th>Status</th>}
                        {props.userId === props.classTeacher && <th>Download Result</th>}
                    </tr>
                </thead>
                <tbody>
                    {quiz_list}
                </tbody>
            </Table>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizList);