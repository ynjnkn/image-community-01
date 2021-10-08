import React from "react";
import {useSelector} from "react-redux";
import { apiKey } from "./firebase";

const Permit = (props) => {
    const user_info = useSelector(state => state.user.user);

    const _session_key = `firebase:authUser:${apiKey}:[DEFAULT]`;

    const is_login = sessionStorage.getItem(_session_key);

    // console.log(user_info);

    if(is_login && user_info){
        return <React.Fragment>{props.children}</React.Fragment>;    
    }

    return null;
}

export default Permit;