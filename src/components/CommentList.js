import React from "react";
import { Grid, Image, Text } from "../elements";

import { useDipatch, useDispatch, useSelector } from "react-redux";
import { actionCreators as commentActions } from "../redux/modules/comment";

const CommentList = (props) => {
    const dispatch = useDispatch();

    const comment_list = useSelector((state) => state.comment.list);

    const { post_id } = props;

    // console.log(comment_list[post_id]);

    React.useEffect(() => {
        if (!comment_list[post_id]) {
            // 코멘트 정보가 없으면 불러오기
            dispatch(commentActions.getCommentFB(post_id));
        }
    }, []);

    // comment가 없거나, post_id가 없으면 아무것도 안넘겨준다!
    if (!comment_list[post_id] || !post_id) {
        return null;
    }

    return (
        <React.Fragment>
            <Grid padding="16px">
                {comment_list[post_id].map(c => {
                    return (<CommentItem key={c.id} {...c} />);
                })}
            </Grid>
        </React.Fragment>
    );
};

CommentList.defaultProps = {
    post_id: null
};

export default CommentList;


const CommentItem = (props) => {

    const { user_profile, user_name, user_id, post_id, contents, insert_dt } = props;
    return (
        <Grid is_flex>
            <Grid is_flex width="auto">
                {/* 프로필 사진 */}
                <Image shape="circle" />
                {/* 유저 네임 */}
                <Text bold>{user_name}</Text>
            </Grid>
            <Grid is_flex margin="0px 4px">
                {/* 댓글 */}
                <Text margin="0px">{contents}</Text>
                {/* 댓글 포스팅 시간 */}
                <Text margin="0px">{insert_dt}</Text>
            </Grid>
        </Grid>
    )
}

CommentItem.defaultProps = {
    user_profile: "",
    user_name: "anonymous",
    user_id: "",
    post_id: 1,
    contents: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, ",
    insert_dt: '2021-01-01 19:00:00'
}