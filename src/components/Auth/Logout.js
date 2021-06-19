import React from 'react';
import {connect} from 'react-redux';
import {logout} from '../../redux/actionCreators';

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(logout())
    }
}

const Logout = props => {
    props.logout();
    return (
        <></>
    )
}

export default connect(null, mapDispatchToProps)(Logout);