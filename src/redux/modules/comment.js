import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realtime } from "../../shared/firebase";
import "moment";
import moment from "moment";

import firebase from "firebase/app";
import { actionCreators as postActions } from "./post";


// 액션 타입
const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";
const LOADING = "LOADING";

// 액션 생성 함수
const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({ post_id, comment_list }));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({ post_id, comment }));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));


// 초기화
const initialState = {
    list: {},
    is_loading: false,
};


// 미들웨어
// addCommentFB는 포스트 아이디(post_id)와 댓글 텍스트(contents)를 받아오는
const addCommentFB = (post_id, contents) => {
    return function (dispatch, getState, { history }) {
        // commentDB 가져오기
        const commentDB = firestore.collection("comment");

        // user 정보 가져오기
        const user_info = getState().user.user;

        // comment 딕셔너리 형식 맞추기
        let comment = {
            post_id: post_id,
            user_id: user_info.uid,
            user_name: user_info.user_name,
            user_profile: user_info.user_profile,
            contents: contents,
            insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
        }

        // commentDB 수정
        commentDB
            // 댓글 추가
            .add(comment)
            .then((doc) => {
                // 댓글에 id 정보 추가하기
                comment = { ...comment, id: doc.id };

                // increment 설정
                const increment = firebase.firestore.FieldValue.increment(1);

                // postDB의 댓글 관련 정보도 수정하기위해 post 컬렉션 불러오기
                const postDB = firestore.collection("post");



                // post_id와 일치하는 포스트 찾기
                const post = getState().post.list.find((l) => l.id === post_id);

                // postDB 수정
                postDB
                    .doc(post_id)
                    // firestore에 comment_cnt 업데이트
                    .update({ comment_cnt: increment })
                    .then((_post) => {
                        dispatch(addComment(post_id, comment));

                        // post_id와 일치하는 포스트가 있을 경우에만
                        // editPost 실행, 댓글 알람 보내기
                        if (post) {
                            dispatch(
                                postActions.editPost(post_id, {
                                    // post redux에 comment_cnt 업데이트
                                    comment_cnt: parseInt(post.comment_cnt) + 1
                                })
                            );

                            const _noti_item = realtime.ref(`noti/${post.user_info.user_id}/list`).push();

                            _noti_item.set({
                                post_id: post.id,
                                user_name: comment.user_name,
                                image_url: post.image_url,
                                insert_dt: comment.insert_dt
                            }, (err) => {
                                if (err) {
                                    console.log("알림 저장 실패");
                                }
                                else {
                                    // 알림 보내기
                                    const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);
                                    // 읽음 상태를 false로 바꾸기
                                    notiDB.update({ read: false });
                                }
                            })
                        }
                    })
            })
    }
};

const getCommentFB = (post_id = null) => {
    return function (dispatch, getState, { history }) {
        // post_id가 없다면 코멘트를 특정할 수 없기 때문에 리턴 (에러 방지)
        if (!post_id) {
            return;
        }

        // 파이어 스토어에서 comment 컬렉션 가져오기
        const commentDB = firestore.collection("comment");

        // commentDB에서 코멘트 추출하기
        commentDB
            .where("post_id", "==", post_id)
            .orderBy("insert_dt", "desc")
            .get()
            .then((docs) => {
                // 댓글 리스트 초기화
                let list = [];

                // 각 댓글별 딕셔너리에 데이터와 아이디 추가하기
                docs.forEach((doc) => {
                    list.push({ ...doc.data(), id: doc.id });
                })

                // SET_COMMENT 실행
                dispatch(setComment(post_id, list))
            })
            .catch(err => {
                console.log("댓글 가져오기 실패", post_id, err);
            });
    };
};



// 리덕스
export default handleActions(
    {
        [SET_COMMENT]: (state, action) => produce(state, (draft) => {
            // comment는 딕셔너리 구조로 만들어서,
            // post_id로 나눠 보관합시다! (각각 게시글 방을 만들어준다고 생각하면 구조 이해가 쉬워요.)
            // console.log(action.payload.comment_list);
            draft.list[action.payload.post_id] = action.payload.comment_list;
        }),

        [ADD_COMMENT]: (state, action) => produce(state, (draft) => {
            // 포스트 아이디가 일치하는 포스트에 댓글 추가하기
            draft.list[action.payload.post_id].unshift(action.payload.comment);
        }),

        [LOADING]: (state, action) =>
            produce(state, (draft) => {
                draft.is_loading = action.payload.is_loading;
            })
    },
    initialState
);

const actionCreators = {
    getCommentFB,
    addCommentFB,
    setComment,
    addComment,
};

export { actionCreators };