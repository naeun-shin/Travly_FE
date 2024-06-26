import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import * as S from '@/components/commons/modals/Modal.style';
import Vote from '@/components/vote/Vote';
import Button from '../buttons/Button';

export const NoticeModal = () => {
  const [slide, setSlide] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  // const modalRef = useRef<HTMLDivElement>(null);
  // 모달 애니메이션 효과를 위한 상태 설정

  useEffect(() => {
    setSlide(true);
  }, []);

  useEffect(() => {
    // 모달의 위치 조정 함수
    const adjustModalPosition = () => {
      const burgerButtonRect = document
        .querySelector('.BurgerMenuIcon')
        ?.getBoundingClientRect(); // 버거 버튼의 위치 정보

      const modal = document.getElementById('notice-modal-root');
      if (burgerButtonRect && modal) {
        modal.style.top = `${
          burgerButtonRect.top + burgerButtonRect.height + window.scrollY
        }px`; // 모달을 버거 버튼 아래에 위치시킴
        modal.style.right = `${window.innerWidth - burgerButtonRect.right}px`; // 모달을 버거 버튼의 오른쪽 정렬
      }
    };

    // 모달이 열릴 때마다 위치 조정
    adjustModalPosition();

    // 창 크기 변경 시 위치 조정
    window.addEventListener('resize', adjustModalPosition);

    return () => {
      window.removeEventListener('resize', adjustModalPosition);
    };
  }, []);

  // 투표 모달을 여는 함수
  const handleOpenVoteModal = () => {
    setIsVoteModalOpen(true);
  };

  // 투표 모달을 닫는 함수
  const handleCloseVoteModal = () => {
    setIsVoteModalOpen(false);
  };

  // 모달 외부 클릭 시 모달 닫기
  const handleCloseModal = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!(event.target as HTMLElement).closest('.ModalContainer')) {
      setSlide(false);
    }
  };

  // 모달 내용을 포함하는 React Portal을 반환합니다.
  // `notice-modal-root`은 modal-root가 이미 사용중일 경우 변경된 고유한 ID입니다.
  // HTML 파일 내에 해당 ID를 가진 요소가 있는지 확인하세요.
  return ReactDOM.createPortal(
    <>
      <S.Modaldrop
        style={{ opacity: slide ? 1 : 0 }}
        onClick={handleCloseModal}
      />
      <S.ModalWrapper
        style={{
          opacity: slide ? 1 : 0,
          transform: slide ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <S.AllModalContainer>
          <S.NotiMenuItem>
            <S.TitleBox>
              <S.Title>
                {' '}
                <img src="/assets/icons/blueDot.svg" />
                봄날의 고성
              </S.Title>{' '}
              플랜에 초대되었습니다. 수락하시겠습니까?
            </S.TitleBox>
            <div>
              <Button
                text="거절"
                color="#F6F6F6"
                textColor="gray"
                borderRadius="15px"
                width="100px"
                borderColor="#F6F6F6"
                marginRight="5px"
              />
              <Button text="수락" borderRadius="15px" width="100px" />
            </div>
          </S.NotiMenuItem>
          <S.NotiMenuItem>
            <S.TitleBox>
              <S.Title>
                {' '}
                <img src="/assets/icons/blueDot.svg" />
                비가 안온다면 어떤 플랜이 나을까요?
              </S.Title>{' '}
              에 투표할 수 있습니다.
            </S.TitleBox>
            <div>
              <Button
                text="투표하러 가기"
                color="#F6F6F6"
                textColor="black"
                borderRadius="15px"
                width="130px"
                borderColor="#F6F6F6"
                onClick={handleOpenVoteModal}
              />
            </div>
          </S.NotiMenuItem>
        </S.AllModalContainer>
      </S.ModalWrapper>
      {/* 투표 모달이 열렸을 때, Vote 컴포넌트를 렌더링합니다. */}
      {isVoteModalOpen && (
        <Vote isOpen={isVoteModalOpen} onClose={handleCloseVoteModal} />
      )}
    </>,
    document.getElementById('notice-modal-root')!,
  );
};
