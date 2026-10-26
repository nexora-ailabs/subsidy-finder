// 앱인토스 콘솔에서 발급받은 값을 넣는다. 비어 있으면 해당 기능은 개발용 동작으로 대신한다.

// 콘솔 > 스마트발송 > 알림 템플릿 코드 (매일 아침 운세 알림)
export const NOTIFICATION_TEMPLATE_CODE = "";

// 콘솔 > 광고 > 보상형 전면 광고 그룹 ID (상세 해석 열기)
export const REWARDED_AD_GROUP_ID = "";

// 홈 하단 "함께하는 사람" 숫자. 실제 집계 값을 넣을 때만 보여준다 (null이면 숨김)
export const USER_COUNT: number | null = null;

// 홈 하단 후기. 실제 사용자 후기만 넣는다 (비어 있으면 "첫 후기 남기기"만 보여줌)
export const REVIEWS: { stars: number; text: string }[] = [];

// 문의하기 링크 (예: 카카오톡 채널, 구글폼, mailto:). 비어 있으면 버튼을 숨긴다
export const CONTACT_URL = "";
