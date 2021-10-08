import React from "react";
import { Grid, Text, Button, Image, Input } from "../elements";
import Upload from "../shared/Upload";
import { useSelector, useDispatch } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";
import { actionCreators as imageActions } from "../redux/modules/image";

const PostWrite = (props) => {
    const { history } = props;
    const dispatch = useDispatch();

    const is_login = useSelector((state) => state.user.is_login);
    const preview = useSelector((state) => state.image.preview);
    const post_list = useSelector((state) => state.post.list);

    // url 파라미터를 통한 포스트 아이디 지정
    const post_id = props.match.params.id;
    // 수정 중인지 아닌지 판단을 위한
    const is_edit = post_id ? true : false;

    // 포스트가 수정 중이라면 해당 포스트의 아이디를 통해 포스트 찾기
    // 수정 중이 아닌 경우(null)는 작성 중인 상태
    let _post = is_edit ? post_list.find((p) => p.id === post_id) : null;

    const [contents, setContents] = React.useState(_post ? _post.contents : "");

    // 렌더링을 처음으로 할 때
    React.useEffect(() => {
        // '수정 중'이지만 새로 고침으로 인해 리덕스 정보가 없어졌을 때
        // 메인페이지로 리턴
        if (is_edit && !_post) {
            console.log("포스트 정보가 없어요!");
            history.goBack();

            return;
        }
        // '수정 중'이라면 이미지 프리뷰 보여주기
        if (is_edit) {
            dispatch(imageActions.setPreview(_post.image_url));
        }
    }, []);

    const changeContents = (e) => {
        // console.log(e.target.value);
        setContents(e.target.value);
    };

    const addPost = () => {
        dispatch(postActions.addPostFB(contents));
    };

    const editPost = () => {
        dispatch(postActions.editPostFB(post_id, { contents: contents }));
    }

    // 로그인 되지 않았다면
    if (!is_login) {
        return (
            <Grid margin="100px 0px" padding="16px" center>
                <Text size="32px" bold>
                    앗! 잠깐!
                </Text>
                <Text size="16px">
                    로그인 후에만 글을 쓸 수 있어요!
                </Text>
                <Button
                    _onClick={() => {
                        history.replace("/login");
                    }}
                >
                    로그인 하러가기
                </Button>
            </Grid>
        );
    }

    // 로그인 되었다면
    else {
        return (
            <React.Fragment>
                <Grid padding="16px">
                    <Text margin="0px" size="36px" bold>
                        {is_edit ? "게시글 수정" : "게시글 작성"}
                    </Text>
                    <Upload />
                </Grid>

                <Grid>
                    <Grid padding="16px">
                        <Text margin="0px" size="24px" bold>
                            미리보기
                        </Text>
                    </Grid>

                    <Image
                        shape="rectangle"
                        src={preview ? preview : "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"}
                    />
                </Grid>

                <Grid padding="16px">
                    <Input
                        value={contents}
                        _onChange={changeContents}
                        label="게시글 내용"
                        placeholder="게시글 작성"
                        multiLine
                    />
                </Grid>

                <Grid padding="16px">
                    {is_edit ?
                        (<Button text="게시글 수정" _onClick={editPost}></Button>)
                        :
                        (<Button text="게시글 작성" _onClick={addPost}></Button>)
                    }
                </Grid>
            </React.Fragment>
        );
    };
}

export default PostWrite;