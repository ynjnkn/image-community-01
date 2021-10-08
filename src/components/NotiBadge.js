import React from "react";
import { Badge } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";

import { realtime } from "../shared/firebase";
import { useSelector } from "react-redux";

const NotiBadge = (props) => {
    const [is_read, setIsRead] = React.useState(true);
    const user_id = useSelector(state => state.user.user.uid);

    const notiCheck = () => {
        const notiDB = realtime.ref(`noti/${user_id}`);
        notiDB.update({read: true});
        props._onClick(); // 알림 페이지로 이동
    };

    React.useEffect(() => {
        const notiDB = realtime.ref(`noti/${user_id}`);

        // Realtime Database에서 유저가 알람 읽은 여부 구독
        notiDB.on("value", (snapshot) => {
            // console.log(snapshot.val());

            setIsRead(snapshot.val().read);
        });

        // 구독 해제
        return () => notiDB.off();
    }, []);

    return (
        <React.Fragment>
            <Badge color="secondary" variant="dot" invisible={is_read} onClick={notiCheck} >
                <NotificationsIcon />
            </Badge>
        </React.Fragment>
    );
}

NotiBadge.defaultProps = {
    _onClick: () => {},
};

export default NotiBadge;