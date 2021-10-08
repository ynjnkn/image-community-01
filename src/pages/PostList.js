import React from "react";
import Post from "../components/Post"

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";
import InfinityScroll from "../shared/InfinityScroll";
import { Grid } from "../elements";

const PostList = (props) => {
    const dispatch = useDispatch();
    const post_list = useSelector((state) => state.post.list);
    const user_info = useSelector((state) => state.user.user);
    const is_loading = useSelector((state) => state.post.is_loading);
    const paging = useSelector((state) => state.post.paging);

    // console.log(post_list);

    const { history } = props;

    // console.log(post_list);

    React.useEffect(() => {
        // 가지고 있는 데이터가 0개, 1개일 때만 새로 데이터를 호출해요.
        if (post_list.length < 2) {
            dispatch(postActions.getPostFB());
        }
    }, []);


    return (
        <React.Fragment>
            <Grid bg={"#EFF6FF"} padding="20px 0px">
            {/* <Grid bg={"#EFF6FF"}> */}
                <InfinityScroll
                    // 페이지의 끝에 다다르면 감춰진 다음 포스트들 보여주기
                    callNext={() => {
                        dispatch(postActions.getPostFB(paging.next));
                    }}
                    is_next={paging.next ? true : false}
                    loading={is_loading}
                >
                    {post_list.map((p, idx) => {

                        // 로그인이 되었고, 포스트의 user_id와 현재 유저의 uid가 동일하다면
                        // is_me 라는 속성 추가
                        if (user_info && p.user_info.user_id === user_info.uid) {
                            return (
                                <Grid
                                    bg="#ffffff"
                                    margin="8px 0px"
                                    key={p.id}
                                    _onClick={() => {
                                        history.push(`/post/${p.id}`);
                                    }}
                                >
                                    <Post key={p.id} {...p} is_me />
                                </Grid>
                            );
                        }
                        else {
                            return (
                                <Grid
                                    key={p.id}
                                    bg="#ffffff"
                                    _onClick={() => {
                                        history.push(`/post/${p.id}`);
                                    }}
                                >
                                    <Post {...p} />
                                </Grid>
                            );
                        }
                    })}
                </InfinityScroll>
            </Grid>
        </React.Fragment>
    )
}

export default PostList;