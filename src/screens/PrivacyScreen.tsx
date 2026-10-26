import { Card, TopBar } from "../components/ui";

// 앱인토스 검수용 개인정보 처리 안내. 실제 운영 정책에 맞게 문구를 확정해야 한다.
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <>
      <TopBar title="개인정보 처리 안내" onBack={onBack} />
      <div className="page-intro">
        <p className="section-eyebrow">PRIVACY</p>
        <h2 className="page-intro-title">내 정보는 이렇게 다뤄져요</h2>
      </div>

      <Card title="수집하는 정보" eyebrow="WHAT">
        <ul className="bullet-list">
          <li>생년월일, 양력/음력, 성별</li>
          <li>태어난 시간, 태어난 도시 (입력한 경우에만)</li>
          <li>앱 이용 기록 (방문한 날, 뽑은 타로 카드, 모은 캐릭터)</li>
        </ul>
      </Card>

      <Card title="이용 목적" eyebrow="WHY">
        <p className="card-text">사주·운세·궁합 분석 결과를 보여주고, 매번 다시 입력하지 않도록 기억하는 데에만 사용해요.</p>
      </Card>

      <Card title="보관 위치와 기간" eyebrow="WHERE">
        <ul className="bullet-list">
          <li>내 정보와 이용 기록은 이 기기에만 저장돼요.</li>
          <li>분석할 때만 운세 분석 서버로 전달되며, 분석 후 보관하지 않아요.</li>
          <li>홈 &gt; 내 정보 &gt; '저장된 정보 지우기'로 언제든 삭제할 수 있어요.</li>
        </ul>
      </Card>

      <Card title="궁합 초대 링크" eyebrow="SHARE">
        <p className="card-text">
          궁합 초대 링크에는 보낸 사람의 생년월일, 태어난 시간, 성별이 담겨요. 링크를 받은 사람은 이 정보를 볼 수 있으니 믿을 수 있는
          사람에게만 보내 주세요.
        </p>
      </Card>

      <p className="result-footer">본 서비스는 자기이해를 돕는 참고용 콘텐츠이며, 의료·법률·재정 등 전문 상담을 대신하지 않아요.</p>
    </>
  );
}
