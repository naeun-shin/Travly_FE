import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ToggleButton from '@/components/commons/buttons/ToggleButton';
import { ModernInput } from '@/components/commons/inputs/Input';
import * as S from '@/components/plans/Plan.style';
import DatePicker, { registerLocale } from 'react-datepicker';
import '@/components/DatePicker.styles.css';
import { Locale } from 'node_modules/date-fns/locale/types';
import ko from 'date-fns/locale/ko';
registerLocale('ko', ko as unknown as Locale);
import { TfiArrowCircleRight } from 'react-icons/tfi';
import { SlLocationPin } from 'react-icons/sl';
import { BiCoinStack } from 'react-icons/bi';
import { CiCalendar } from 'react-icons/ci';

registerLocale('ko', ko as unknown as Locale);

const PlanUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);
  const [dateRange, setDateRange] = useState<[Date?, Date?]>([
    undefined,
    undefined,
  ]);
  const [totalPlanTitle, setTotalPlanTitle] = useState<string>('');
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [area, setArea] = useState<string>('');
  const [tripStartDate, setTripStartDate] = useState<string>('');
  const [tripEndDate, setTripEndDate] = useState<string>('');
  const [focusState, setFocusState] = useState({
    title: false,
    area: false,
    budget: false,
  });
  const [title, setTitle] = useState<string>('');
  const [planId, setPlanId] = useState<number>(0);

  useEffect(() => {
    console.log('초기 location 상태:', location.state);
    const { wholePlan } = location.state || {};
    if (wholePlan) {
      const {
        isPublic,
        startDate,
        endDate,
        totalPlanTitle,
        budget,
        area,
        title,
        tripEndDate,
        tripStartDate,
        planId,
      } = wholePlan;
      setIsPublic(isPublic || true); // undefined일 경우 기본값 true
      setTitle(title || '');
      setArea(area || '');
      setTotalPlanTitle(totalPlanTitle || title);
      setTotalBudget(budget || 0);
      setTripStartDate(tripStartDate || startDate);
      setTripEndDate(tripEndDate || endDate);
      setDateRange([
        startDate
          ? new Date(startDate)
          : tripStartDate
            ? new Date(tripStartDate)
            : undefined,
        endDate
          ? new Date(endDate)
          : tripEndDate
            ? new Date(tripEndDate)
            : undefined,
      ]);
      setPlanId(planId);
    }
  }, [location.state]); // location.state에 의존성을 두어 반응성을 보장

  useEffect(() => {
    updateLocalStorage();
  }, [isPublic, dateRange, totalPlanTitle, totalBudget, area]);

  const updateLocalStorage = () => {
    const data = {
      isPublic,
      startDate: dateRange[0] ? dateRange[0].toISOString() : tripStartDate,
      endDate: dateRange[1] ? dateRange[1].toISOString() : tripEndDate,
      totalPlanTitle,
      totalBudget,
      area,
      planId,
    };
    localStorage.setItem('updatePlanData', JSON.stringify(data));
  };

  const handleFocus = (field: keyof typeof focusState) => {
    setFocusState({ ...focusState, [field]: true });
  };

  const handleBlur = (
    field: keyof typeof focusState,
    e: React.FocusEvent<HTMLInputElement>,
  ) => {
    if (field === 'budget' && e.target.value.trim() === '') {
      setTotalBudget(0);
    }
    setFocusState({ ...focusState, [field]: false });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArea(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value);
    setTitle(e.target.value);
    setTotalPlanTitle(e.target.value);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const budgetValue = e.target.value.replace(/\D/g, '');
    const numericBudget = parseInt(budgetValue, 10);
    // 유효한 숫자인 경우 상태를 업데이트
    if (!isNaN(numericBudget)) {
      setTotalBudget(numericBudget);
    } else {
      setTotalBudget(0); // 유효하지 않은 경우, 0으로 설정
    }
  };

  // 포맷된 예산을 반환하는 함수
  const formattedBudget = () => {
    // totalBudget이 정의되지 않았거나 0인 경우 '0'을 반환
    if (!totalBudget) return '0';
    // 유효한 숫자인 경우 포맷하여 반환
    return totalBudget.toLocaleString();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 날짜만 유효하게 하고, 시간은 00:00으로 설정

  const displayDateRange = () => {
    const start = dateRange[0]
      ? dateRange[0].toLocaleDateString()
      : tripStartDate;
    const end = dateRange[1] ? dateRange[1].toLocaleDateString() : tripEndDate;
    return start && end ? `${start} - ${end}` : '날짜를 선택하세요';
  };

  const handleDateRangeChange = (update: [Date, Date]) => {
    setDateRange(update);
  };

  const toggleIsPublic = () => {
    setIsPublic((prev) => !prev);
  };

  // 다음 버튼 활성화 여부 검사
  const canProceed =
    totalPlanTitle.trim() &&
    totalBudget > 0 &&
    area.trim() &&
    dateRange[0] &&
    dateRange[1];

  const handleNextClick = () => {
    if (!canProceed) {
      console.error('진행할 수 없습니다, 일부 입력이 누락되었습니다.');
      alert('모든 입력을 완료해야 다음으로 진행할 수 있습니다.');
      return;
    }

    navigate(`/planUpdate/2/${planId}`, {
      state: {
        planDetails: {
          tripStartDate: dateRange[0]?.toLocaleDateString(),
          tripEndDate: dateRange[1]?.toLocaleDateString(),
          isPublic,
          totalPlanTitle,
          totalBudget,
          area,
        },
      },
    });
  };

  return (
    <>
      {/* 전체 컨테이너 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* 작성 컨테이너 */}
        <div
          style={{
            width: '100%',
            paddingRight: '10%',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              {' '}
              제목 &nbsp; <img src="/assets/icons/requiredPoint.svg" />
            </div>
            <S.PlanBoxWithSpaceBetween>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {focusState.title && (
                  <img
                    src="/assets/icons/Rectangle.png"
                    style={{ height: '30px' }}
                  />
                )}
                <ModernInput
                  type="text"
                  placeholder="제목을 입력하세요"
                  width={400}
                  height={50}
                  border="transparent"
                  fontSize={18}
                  fontWeight={'bold'}
                  onFocus={() => handleFocus('title')}
                  onBlur={(e) => handleBlur('title', e)}
                  onChange={handleTitleChange}
                  value={title}
                />
              </div>

              <div>
                <ToggleButton isChecked={isPublic} onToggle={toggleIsPublic} />
              </div>
            </S.PlanBoxWithSpaceBetween>
          </div>
          <div>
            {/* 플랜 계획 첫페이지 */}
            <div>
              {/* 지역 */}
              <S.PlanBox>
                <div
                  style={{
                    backgroundColor: '#C5F1FF',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SlLocationPin size="25px" color="white" />
                </div>
                <S.PlanContent>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}
                  >
                    지역 &nbsp; <img src="/assets/icons/requiredPoint.svg" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {focusState.area && (
                      <img
                        src="/assets/icons/Rectangle.png"
                        style={{ height: '25px' }}
                      />
                    )}
                    <ModernInput
                      type="text"
                      placeholder="지역을 입력하세요"
                      width={400}
                      border="transparent"
                      fontSize={16}
                      height={30}
                      onFocus={() => handleFocus('area')}
                      onBlur={(e) => handleBlur('area', e)}
                      onChange={handleAreaChange}
                      value={area} // Bind the input value to the area state
                    />
                  </div>
                </S.PlanContent>
              </S.PlanBox>
              <hr />
              {/*예산 */}
              <S.PlanBox>
                <div
                  style={{
                    backgroundColor: '#C5F1FF',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BiCoinStack size="25px" color="white" />
                </div>
                <S.PlanContent>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}
                  >
                    예산 &nbsp; <img src="/assets/icons/requiredPoint.svg" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {focusState.budget && (
                      <img
                        src="/assets/icons/Rectangle.png"
                        style={{ height: '30px' }}
                      />
                    )}
                    <ModernInput
                      type="text"
                      placeholder="예산을 입력하세요"
                      width={400}
                      border="transparent"
                      fontSize={16}
                      height={30}
                      onFocus={() => handleFocus('budget')}
                      onBlur={(e) => handleBlur('budget', e)}
                      onChange={handleBudgetChange}
                      value={formattedBudget()} // Display the formatted budget
                    />
                  </div>
                </S.PlanContent>
              </S.PlanBox>
              <hr />
              {/*기간 선택*/}
              <S.PlanBox>
                <div
                  style={{
                    backgroundColor: '#C5F1FF',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CiCalendar size="25px" color="white" />
                </div>
                <S.PlanBoxWithCalendar>
                  <div style={{ paddingLeft: '15px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}
                    >
                      여행기간 &nbsp;{' '}
                      <img src="/assets/icons/requiredPoint.svg" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div> {displayDateRange()}</div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: '400px' }}>
                    <TfiArrowCircleRight size="35px" color="lightGray" />
                  </div>
                </S.PlanBoxWithCalendar>
              </S.PlanBox>
              <hr />
            </div>
          </div>
        </div>
        {/* 달력 컨테이너 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <DatePicker
            locale="ko"
            selectsRange={true}
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={handleDateRangeChange}
            dateFormat="yyyy-MM-dd"
            inline
            minDate={today} // 오늘 날짜 이후만 선택 가능하도록 설정
          />
        </div>
      </div>
      <S.PlanBottomSection>
        {/* 다음 버튼 */}
        <S.PlanNextButton onClick={handleNextClick} disabled={!canProceed}>
          다음
        </S.PlanNextButton>
      </S.PlanBottomSection>
    </>
  );
};

export default PlanUpdate;
