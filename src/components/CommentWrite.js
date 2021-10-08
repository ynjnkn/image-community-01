import React from "react";
import { Grid, Input, Button } from "../elements";

import {actionCreators as commentActions} from "../redux/modules/comment";
import {useSelector, useDispatch} from "react-redux";

const CommentWrite = (props) => {
  const dispatch = useDispatch();

  const {post_id} = props;

  // 댓글 인풋에 입력된 댓글 텍스트의 state 변경하기
  const [comment_text, setCommentText] = React.useState();

  // 댓글 인풋이 onChange일 때
  const onChange = (e) => {
    // console.log(e.target.value);
    setCommentText(e.target.value);
  };

  // '작성' 버튼이 눌렸을 때 인풋에 있는 값 지움
  const write = () => {
    // console.log(comment_text);
    dispatch(commentActions.addCommentFB(post_id, comment_text));
    setCommentText("");
  }

  return (
    <React.Fragment>
      <Grid padding="16px" is_flex>
        <Input
          placeholder="댓글 내용을 입력해주세요 :)"
          _onChange={onChange}
          // "작성" 버튼이 눌리면 인풋에 있는 값을 지우기 위해 value 지정
          value = {comment_text}
          onSubmit = {write}
          is_Submit
        />
        <Button
          width="50px"
          margin="0px 2px 0px 2px"
          _onClick={write}
        >
          작성
        </Button>
      </Grid>
    </React.Fragment>
  );
}

export default CommentWrite;