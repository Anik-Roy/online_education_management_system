import React, {useEffect} from 'react';
import './QuizResponses.css';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {fetchQuizResponses} from '../../../../../redux/actionCreators';
import { Card, Table } from 'reactstrap';
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
    console.log(props);
    const {quizId} = props;

    useEffect(() => {
        props.fetchQuizResponses(quizId);
    }, [quizId]);

    let quiz_responses = props.quizResponses.map(quiz_response => (
        <tr key={quiz_response.key}>
          <th scope="row">{quiz_response.user_id}</th>
          <td>{quiz_response.total_correct}</td>
          <td>{quiz_response.total_wrong}</td>
          <td><Link to="/"><FontAwesomeIcon className="mr-3" style={{color: "black"}} icon={faHandPointUp} />Show response</Link></td>
        </tr>
    ))
    return (
        <div>
            <h3>Quiz responses</h3>
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
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizResponses);