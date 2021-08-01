import React, {useEffect} from 'react';
import './QuizList.css';
import { connect } from 'react-redux';
import {fetchQuizes} from '../../../../redux/actionCreators';

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
        return (<div key={quiz.key}>
            <li><a href="#">{quiz.data.title}</a></li>
        </div>);
    });

    return (
        <div>
            <h3 className="quiz-title">Quiz List</h3>
            <ul>
                {quiz_list}
            </ul>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizList);