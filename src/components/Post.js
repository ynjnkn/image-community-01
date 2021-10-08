import React from "react";
import { Grid, Image, Text, Button } from "../elements";
import { history } from "../redux/configureStore";
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import { useDispatch, useSelector } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";


const Post = (props) => {
  const dispatch = useDispatch();
  const post_list = useSelector((state) => (state.post.list));
  const post_idx = post_list.findIndex((p) => p.id === props.id);
  const liked_post_id = post_list[post_idx]['id'];

  const [is_like, setIsLike] = React.useState(false);

  const likePost = () => {
    console.log('좋아요!');
    dispatch(postActions.updatePostLikeCountFB(liked_post_id));
  };

  const dislikePost = () => {
    console.log('좋아요 취소!');
    // post redux에서 like_cnt -1
  }

  // console.log(is_like);

  // 

  return (
    <React.Fragment>
      <Grid margin="20px 0px">
        {/* 프로필 사진, 아이디, 포스팅 시간 */}
        <Grid is_flex padding="16px">
          <Grid is_flex width="auto">
            <Image shape="circle" src={props.src} />
            <Text bold>{props.user_info.user_name}</Text>
          </Grid>
          <Grid is_flex width="auto">
            <Text>{props.insert_dt}</Text>
            {/* is_me일 경우에 */}
            {props.is_me && (
              <Button
                width="auto"
                padding="4px"
                margin="4px"
                _onClick={() => {
                  history.push(`/write/${props.id}`)
                }}
              >
                수정
              </Button>
            )}
          </Grid>
        </Grid>

        {/* 텍스트 */}
        <Grid padding="16px">
          <Text>{props.contents}</Text>
        </Grid>

        {/* 이미지 */}
        <Grid>
          <Image shape="rectangle" src={props.image_url} />
        </Grid>

        <Grid padding="16px">
          <Grid is_flex>
            {/* 좋아요/좋아요 취소 버튼 */}
            {is_like ?
              <FavoriteIcon onClick={dislikePost} />
              :
              <FavoriteBorderIcon onClick={likePost} />
            }



            {/* 좋아요 갯수 */}
            <Text bold>좋아요 [like_cnt] 개</Text>

            {/* 댓글 갯수 */}
            <Text bold>댓글 {props.comment_cnt}개</Text>
          </Grid>
        </Grid>


      </Grid>
    </React.Fragment>
  );
}

// Post.js의 defaultProps
// 1. userinfo: 유저 정보에 대한 딕셔너리 (user_name, user_profile)
// 2. image_url: 이미지 url
// 3. contents: 텍스트 컨텐츠
// 4. comment_cnt: 댓글 갯수
// 5. insert_dt: 포스팅 시간
Post.defaultProps = {
  user_info: {
    user_name: "ynjnkn1111",
    user_profile: "https://www.kazoart.com/blog/wp-content/uploads/2019/10/Roy-Lichtenstein-Crying-Girl-1964-1140x1140.jpg",
  },
  image_url: "https://www.kazoart.com/blog/wp-content/uploads/2019/10/Roy-Lichtenstein-Crying-Girl-1964-1140x1140.jpg",
  contents: "Crying Girl (1964) by Roy Lichtenstein",
  comment_cnt: 10,
  insert_dt: "2021-02-27 10:00:00",
};

export default Post;