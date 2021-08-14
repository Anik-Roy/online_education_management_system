import React, {Component} from 'react';
import './Classwork.css';
import {connect} from 'react-redux';
import CreateClassWork from './CreateClassWork/CreateClassWork';
import QuizList from './QuizList/QuizList';
import AssignmentList from './AssignmentList/AssignmentList';

const mapStateToProps = state => {
    return {
        userId: state.userId
    }
}

class Classwork extends Component {
    render() {
        return (
            <div>
                {/* create classwork */}
                {this.props.classTeacher === this.props.userId && <CreateClassWork clsId={this.props.clsId} />}
                
                {/* quiz list */}
                <QuizList clsId={this.props.clsId} classTeacher={this.props.classTeacher} />

                {/* assignment list */}
                <AssignmentList clsId={this.props.clsId} classTeacher={this.props.classTeacher} />
            </div>
        );
    }
}

export default connect(mapStateToProps)(Classwork);