import React, {Component} from 'react';
import './Classwork.css';
import CreateClassWork from './CreateClassWork/CreateClassWork';

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
                
            </div>
        );
    }
}

export default Classwork;