import React, {useEffect} from 'react';
import './QuizList.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {fetchQuizes} from '../../../../redux/actionCreators';
import {faFileAlt, faTable, faSort} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const mapStateToProps = state => {
    return {
        classQuizes: state.classQuizes
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchQuizes: clsId => dispatch(fetchQuizes(clsId))
    }
}

const QuizList = props => {
    // console.log(props);
    let {classQuizes, fetchQuizes, clsId} = props;
    console.log(classQuizes);

    useEffect(() => {
        fetchQuizes(clsId);
    }, []);

    let quiz_list = classQuizes.map(quiz => {
        return (
            <li key={quiz.key} className="quiz-item">
                <Link to={{pathname: `/class/${clsId}/${quiz.key}`, state: { quizDetails: quiz }}} className="quiz-headline">{quiz.data.title}&nbsp;<sub style={{color: "red"}}>Due date: {quiz.data.dueDate}</sub></Link>
            </li>
        );
    });

    return (
        <div>
            {!quiz_list && <div className="class-work-info">
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
            }
            {/* <h3 className="quiz-title">Quiz List</h3> */}
            <ol className="quiz-list">
                {quiz_list}
            </ol>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizList);