import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import { connect } from 'react-redux';
import {authCheck} from '../redux/actionCreators';
import Layout from './Layout';
import Signup from './Auth/Signup';
import Login from './Auth/Login';
import Logout from './Auth/Logout';
import Home from './Home/Home';
import ClassDetails from './ClassDetails/ClassDetails';
import QuizDetails from './ClassDetails/Classwork/QuizDetails/QuizDetails';
import AssignmentDetails from './ClassDetails/Classwork/AssignmentDetails/AssignmentDetails';
import Profile from './Profile/Profile';

const mapStateToProps = state => {
    return {
        token: state.token,
        userId: state.userId,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        authCheck: () => dispatch(authCheck())
    }
}

class Main extends Component {

    componentDidMount() {
        this.props.authCheck();
    }

    render() {
        // console.log(this.props.userId);
        let routes = null;

        if(this.props.token === null) {
            routes = (
                <Switch>
                    <Route path="/signup" component={Signup} />
                    <Route path="/login" component={Login} />
                    <Redirect to="/login" />
                </Switch>
            )
        } else {
            routes = (
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/class/:classId" component={ClassDetails} />
                    {/* <Route path="/class/:classId" render={props => (<ClassDetails {...props} clsId={props.match.params.classId} />)} /> */}
                    <Route path="/class/:classId/:quizId/quiz" component={QuizDetails} />
                    <Route path="/class/:classId/:assignmentId/assignment" component={AssignmentDetails} />
                    <Route path="/logout" component={Logout} />
                    <Route path="/profile" component={Profile} />
                    <Redirect to="/" />
                </Switch>
            )
        }

        return (
            <Layout>
                {routes}
            </Layout>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);