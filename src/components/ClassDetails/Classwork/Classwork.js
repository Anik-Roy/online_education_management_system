import React, {Component} from 'react';
import './Classwork.css';
import CreateClassWork from './CreateClassWork/CreateClassWork';
import QuizList from './QuizList/QuizList';

class Classwork extends Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        // console.log(this.props);
        return (
            <div>
                {/* create classwork */}
                <CreateClassWork clsId={this.props.clsId} />
                
                {/* quiz list */}
                <QuizList clsId={this.props.clsId} />
            </div>
        );
    }
}

export default Classwork;