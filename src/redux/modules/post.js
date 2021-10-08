import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";
import "moment";
import moment from "moment";

import firebase from "firebase/app";
import { actionCreators as imageActions } from "./image";


// 액션 타입
const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING";
const LIKE_POST = "LIKE_POST";


// 액션 생성 함수
const setPost = createAction(SET_POST, (post_list, paging) => ({ post_list, paging }));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));



// 초기화
const initialState = {
  list: [],
  paging: { start: null, next: null, size: 3 },
  is_loading: false,
};

const initialPost = {
  image_url: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  contents: "",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
  like_cnt: 0,
  // like: [{like_post_id, like_user_id, is_like}]
};



// 미들웨어
// likePostFB: 특정 포스트에 대한 좋아요 갯수를 글로벌하게 업데이트 해주는 함수
// 각 포스트별로 각 유저가 좋아요를 했는지 여부를 체크 (is_like)
// is_like가 true일 때, like_cnt + 1
// is_like가 false일 때, like_cnt - 1
const updatePostLikeCountFB = (post_id) => {
  return function (dispatch, getState, { history }) {
    // '좋아요'가 실행된 포스트 가져오기
    const post = getState().post.list.find((l) => l.id === post_id);

    // '좋아요'를 실행한 현재 유저 정보 가져오기
    const user_info = getState().user.user;

    // 좋아요 정보 초기화
    let _like = {
      post_id: post_id,
      user_id: user_info.uid,
      is_like: null,
    }

    // Firestore에서 likeDB 가져오기
    const likeDB = firestore.collection("like");

    // likeDB에 현재 '좋아요'가 된 포스트의 포스트 id와 유저 id와
    // 동일한 데이터가 있는지 확인
    likeDB
      .where("post_id", "==", post_id)
      .where("user_id", "==", user_info.uid)
      .get()
      .then((querySnapshot) => {
        let count = 0;

        // 각 댓글별 딕셔너리에 데이터와 아이디 추가하기
        querySnapshot.forEach((doc) => {
          count += 1;
          // list.push({ ...doc.data(), id: doc.id });
          console.log(doc.data(), count);

          // 
        })
      })

    // increment 설정
    const increment = firebase.firestore.FieldValue.increment(1);

    // decrement 설정
    const decrement = firebase.firestore.FieldValue.increment(-1);

    // console.log(user_info);
    // console.log(post.like_cnt);
    // console.log(_like);

    // is_like가 false일 경우 (좋아요가 되지 않은 상태)
    // is_like를 true로 변경 (좋아요 상태로 변경)
    // post redux에 like_cnt + 1
    // FB postDB에 like_cnt + 1

    // is_like가 true일 경우 (좋아요된 상태)
    // is_like를 false로 변경 (좋아요가 되지 않은 상태로 변경)
    // post redux에 like_cnt - 1
    // FB postDB에 like_cnt - 1

    // 변경된 is_like가 포함된 _like를 Firestore의 likeDB로 전달
    // 

    // likeDB 수정
    likeDB
      .add(_like)
      .then((doc) => {
        _like = { ..._like, id: doc.id };
        console.log(_like);


      })





  };
};


const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }

    // 이미지 프리뷰를 위해 이미지 url 가져오기
    const _image = getState().image.preview;

    // 스토어에서 수정하려고 하는 포스트 아이디에 해당하는 포스트 선택
    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];

    // console.log(_post);

    // postDB 불러오기
    const postDB = firestore.collection("post");

    console.log(post);

    // 이미지를 업데이트하지 않는 경우
    if (_image === _post.image_url) {
      postDB
        .doc(post_id) // 포스트 아이디에 해당하는 포스트 불러오기
        .update(post) // 포스트 업데이트
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
          history.replace("/");
        });

      return;
    }
    // 이미지를 업데이트 하는 경우
    else {
      const user_id = getState().user.user.uid;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");

      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            console.log(url);

            return url;
          })
          .then((url) => {
            postDB
              .doc(post_id)
              .update({ ...post, image_url: url })
              .then((doc) => {
                dispatch(editPost(post_id, { ...post, image_url: url }));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

const addPostFB = (contents = "") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    const _user = getState().user.user;

    // 유저 정보 형식 맞추기
    const user_info = {
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };

    // 포스트 정보 형식 맞추기
    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    // 삽입할 이미지 url 가져오기
    const _image = getState().image.preview;

    // console.log(_image);
    // console.log(typeof _image);

    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url");

    _upload.then((snapshot) => {
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          console.log(url);

          return url;
        })
        .then((url) => {
          postDB
            .add({ ...user_info, ..._post, image_url: url })
            .then((doc) => {
              let post = { user_info, ..._post, id: doc.id, image_url: url };
              // 리덕스에 포스트 추가 액션 실행
              dispatch(addPost(post));
              history.replace("/");

              // 리덕스에 이미지 프리뷰 액션 실행
              dispatch(imageActions.setPreview(null));
            })
            .catch((err) => {
              window.alert("앗! 포스트 작성에 문제가 있어요!");
              console.log("post 작성에 실패했어요!", err);
            });
        })
        .catch((err) => {
          window.alert("앗! 이미지 업로드에 문제가 있어요!");
          console.log("앗! 이미지 업로드에 문제가 있어요!", err);
        });
    });
  };
};

// 시작점 정보, 가져올 포스트 갯수를 인풋으로
const getPostFB = (start = null, size = 3) => {
  return function (dispatch, getState, { history }) {

    // paging 정보 가져오기
    let _paging = getState().post.paging;

    // 시작 정보가 기록되었는데, 다음 가져올 데이터가 없다면?
    // 포스트 리스트가 끝났다는 의미 => 아무것도 하지 말고 리턴
    if (_paging.start && !_paging.next) {
      return;
    }

    // 로딩 시작 (is_loading: false => true)
    dispatch(loading(true));

    const postDB = firestore.collection("post");

    // 포스팅 시간의 역순으로 쿼리 보여주기
    let query = postDB.orderBy("insert_dt", "desc")

    // 시작점 정보가 있다면 해당 지점에서 query 시작
    if (start) {
      query = query.startAt(start);
    }

    // 가져온 query에 대해
    query
      // 사이즈보다 1개 더 크게 가져오기
      // 3개씩 끊어서 보여준다고 할 때, 4개를 가져올 수 있다면? 다음 페이지가 있음을 알 수 있음
      // 만약 4개 미만이라면? 다음 페이지는 없음
      .limit(size + 1)
      .get()
      .then(docs => {

        // 포스트 리스트 초기화
        let post_list = [];

        // 새로운 페이징 정보 만들기
        let paging = {
          // query로 가져온 문서의 첫 번째 항목 
          start: docs.docs[0],
          // query로 가져온 문서의 갯수가 4개라면 => next: docs.docs[3]
          // 그렇지 않다면 => next: null
          next: docs.docs.length === size + 1 ? docs.docs[docs.docs.length - 1] : null,
          size: size,
        };

        // 포스트 리스트 만들기
        docs.forEach((doc) => {
          let _post = doc.data();

          // 포스트가 포함해야할 데이터 형식 맞추기
          let post = Object.keys(_post).reduce(
            (acc, cur) => {
              if (cur.indexOf("user_") !== -1) {
                return {
                  ...acc,
                  user_info: { ...acc.user_info, [cur]: _post[cur] },
                };
              }
              return { ...acc, [cur]: _post[cur] };
            },
            { id: doc.id, user_info: {} }
          );

          // 포스트 리스트에 포스트 추가
          // 포스트가 4개씩 들어간 상태
          post_list.push(post);
        });

        // 포스트 리스트의 포스트 갯수가 3이 되도록 마지막 포스트 제외
        if (paging.next) {
          post_list.pop();
        }
        // console.log(post_list);

        // 리덕스에 포스트 리스트와 페이징 정보 넘기기
        dispatch(setPost(post_list, paging));
      })

    return;

    postDB.get().then((docs) => {
      let post_list = [];
      docs.forEach((doc) => {
        let _post = doc.data();

        // ['commenct_cnt', 'contents', ..]
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              };
            }
            return { ...acc, [cur]: _post[cur] };
          },
          { id: doc.id, user_info: {} }
        );

        post_list.push(post);
      });

      console.log(post_list);

      dispatch(setPost(post_list));
    });
  };
};

const getOnePostFB = (id) => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");
    postDB.doc(id).get().then(doc => {
      // console.log(doc);
      // console.log(doc.data());

      let _post = doc.data();
      let post = Object.keys(_post).reduce(
        (acc, cur) => {
          if (cur.indexOf("user_") !== -1) {
            return {
              ...acc,
              user_info: { ...acc.user_info, [cur]: _post[cur] },
            };
          }
          return { ...acc, [cur]: _post[cur] };
        },
        { id: doc.id, user_info: {} }
      );

      dispatch(setPost([post]));
    })
  }
}


// 리듀서
export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        // 포스트 리스트에 새로운 포스트 추가
        draft.list.push(...action.payload.post_list);

        // 중복되는 포스트 제거 (메인페이지를 거치지 않고 getOnePostFB를 실행해야하는 상황일 때)
        draft.list = draft.list.reduce((acc, cur) => {
          // 중복되는 포스트가 없을 경우
          // acc 배열의 각 요소의 id가 현재 포스트의 id가 겹치지 않는다면 (-1)
          if (acc.findIndex(a => a.id === cur.id) === -1) {
            return [...acc, cur];
          }
          // 중복되는 경우
          else {
            // 현재 포스트의 값으로 덮어 씌우기
            acc[acc.findIndex((a) => a.id === cur.id)] = cur;
            return acc;
          }
        }, []);

        // paging이 있을 경우에만
        if (action.payload.paging) {
          draft.paging = action.payload.paging;
          draft.is_loading = false;
        };

      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),

    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        // 인덱스 찾기: 포스트들 중 수정하려고 하는 포스트의 아이디에 해당하는
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);

        // 인덱스로 찾은 포스트 수정하기
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),

    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
  },
  initialState
);



const actionCreators = {
  setPost,
  addPost,
  editPost,
  getPostFB,
  addPostFB,
  editPostFB,
  getOnePostFB,
  updatePostLikeCountFB,
};

export { actionCreators };