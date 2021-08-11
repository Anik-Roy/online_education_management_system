import React, {useState, useEffect} from 'react';
import './QuizList.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {fetchQuizes, fetchQuizResponses} from '../../../../redux/actionCreators';
import {faFileAlt, faTable, faSort, faDownload} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table, Spinner } from 'reactstrap';
import { CSVLink } from "react-csv";

const mapStateToProps = state => {
    return {
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
    // console.log(props);
    let {classQuizes, fetchQuizes, clsId} = props;
    // console.log(classQuizes);
    let [selectedQuiz, setSelectedQuiz] = useState(null);

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
    
    let headers = [
        { label: "Email", key: "email" },
        { label: "Full Name", key: "fullName" },
        { label: "Student Id", key: "universityId" },
        { label: "Mobile no", key: "mobileNo" },
        { label: "Total correct", key: "total_correct" },
        { label: "Total wrong", key: "total_wrong" }
    ];

    useEffect(() => {
        fetchQuizes(clsId);
    }, [fetchQuizes, clsId]);

    let quiz_list = classQuizes.map((quiz, idx) => {
        let dueDate = new Date(quiz.data.dueDate);
        return (
            <tr key={quiz.key}>
                <th scope="row">{idx+1}</th>
                <td><Link to={{pathname: `/class/${clsId}/${quiz.key}/quiz`, state: { quizDetails: quiz }}}>{quiz.data.title}</Link></td>
                <td>{dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}</td>
                <td></td>
                <td>
                    {/* <button className="btn btn-outpine-secondary" onClick={() => console.log(quiz)}>Export as csv</button> */}
                    <FontAwesomeIcon icon={faDownload} style={{fontSize: "18px"}} onClick={() => {setSelectedQuiz(quiz.key); props.fetchQuizResponses(quiz.key)}} />&nbsp;
                    {props.fetchQuizResponsesLoading === true && selectedQuiz === quiz.key && <Spinner color="success" />}
                    {props.fetchQuizResponsesLoading === false && props.quizResponses.length === 0 && selectedQuiz === quiz.key && <span>No response submitted!</span>}
                    {props.fetchQuizResponsesLoading === false && props.quizResponses.length > 0 && selectedQuiz === quiz.key && <CSVLink
                        data={data}
                        headers={headers}
                        className="btn btn-outline-secondary">
                        Export as csv
                    </CSVLink>}
                </td>
            </tr>
        );
    });
    
    return (
        <div>
            {quiz_list.length === 0 && <div className="class-work-info">
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
                </div>
            }
            <h3>Quiz List</h3>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Quiz Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Download Result</th>
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