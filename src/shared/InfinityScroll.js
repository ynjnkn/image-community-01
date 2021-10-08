import React from "react";
import _ from "lodash";
import { Spinner } from "../elements"

const InfinityScroll = (props) => {
    const { children, callNext, is_next, loading } = props;

    // shared/InfinityScroll.js
    const _handleScroll = _.throttle(() => {
        const { innerHeight } = window;
        const { scrollHeight } = document.body;

        // 스크롤 계산!
        const scrollTop =
            (document.documentElement && document.documentElement.scrollTop) ||
            document.body.scrollTop;

        if (scrollHeight - innerHeight - scrollTop < 200) {
            // 로딩 중이면 다음 걸 부르면 안되겠죠!
            if (loading) {
                return;
            }

            callNext();
        }
    }, 300);

    const handleScroll = React.useCallback(_handleScroll, [loading]);

    // 리렌더링될 때마다 실행할 액션들
    React.useEffect(() => {
        // 로딩 중이면, return!
        if (loading) {
            return;
        }

        // 다음 게 있으면 이벤트를 붙이고, 없으면 이벤트를 삭제해요!
        if (is_next) {
            window.addEventListener("scroll", handleScroll);
        } else {
            window.removeEventListener("scroll", handleScroll);
        }

        // 클린업 (InfinityScroll 컴포넌트가 화면에서 사라질 때 리턴)
        return () => window.removeEventListener("scroll", handleScroll);
    }, [is_next, loading]);

    return (
        <React.Fragment>
            {props.children}
            {is_next && <Spinner />}
        </React.Fragment>
    )
}

InfinityScroll.defaultProps = {
    // children => InfinityScroll이 품은 내용물
    children: null,
    // CallNext => 다음 데이터들을 불러오는 함수
    callNext: () => { },
    // is_next => 다음 데이터가 있니?
    is_next: false,
    // loading => 로딩 중이니?
    loading: false,
};

export default InfinityScroll;