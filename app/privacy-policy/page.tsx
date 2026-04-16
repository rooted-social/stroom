import { LandingNavbar } from "@/components/templates/landing-navbar";

const policySections = [
  {
    title: "1. 수집하는 개인정보 항목",
    items: [
      "회원가입 및 서비스 이용 시 이름, 아이디, 이메일 주소를 수집합니다.",
      "서비스 이용 과정에서 접속 로그, 브라우저 정보, 쿠키 등 서비스 운영에 필요한 정보가 자동으로 생성되어 수집될 수 있습니다.",
    ],
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    items: [
      "회원가입, 계정 식별 및 서비스 제공",
      "서비스 공지사항, 업데이트, 이벤트 소식 전달",
      "사용자 문의 응대 및 불만 처리",
      "서비스 품질 개선 및 통계 분석",
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    items: [
      "원칙적으로 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.",
      "관계 법령에 따라 보관이 필요한 경우 해당 법령에서 정한 기간 동안 안전하게 보관합니다.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    items: [
      "회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.",
      "다만 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우에는 예외로 할 수 있습니다.",
    ],
  },
  {
    title: "5. 개인정보 처리 위탁",
    items: [
      "원활한 서비스 제공을 위해 클라우드 인프라, 데이터 저장, 이메일 발송 등 업무 일부를 외부 전문 업체에 위탁할 수 있습니다.",
      "위탁 시 관련 법령에 따라 수탁자가 개인정보를 안전하게 처리하도록 관리·감독합니다.",
    ],
  },
  {
    title: "6. 이용자의 권리와 행사 방법",
    items: [
      "이용자는 언제든지 본인의 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.",
      "권리 행사는 고객 문의 채널을 통해 요청할 수 있으며, 회사는 지체 없이 필요한 조치를 진행합니다.",
    ],
  },
  {
    title: "7. 개인정보의 파기 절차 및 방법",
    items: [
      "보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방식으로 안전하게 파기합니다.",
      "전자적 파일 형태는 기술적 방법을 사용해 복구 불가능하도록 삭제하며, 출력물은 분쇄 또는 소각 방식으로 파기합니다.",
    ],
  },
  {
    title: "8. 개인정보 보호를 위한 기술적·관리적 조치",
    items: [
      "개인정보 접근 권한 최소화, 접근 통제, 로그 모니터링, 암호화 등 보안 조치를 적용합니다.",
      "임직원 대상 개인정보 보호 교육 및 내부 관리 정책을 운영합니다.",
    ],
  },
  {
    title: "9. 개인정보 보호책임자 및 문의",
    items: [
      "개인정보 보호 관련 문의는 아래 연락처로 요청할 수 있습니다.",
      "이메일: privacy@stroom.kr",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/privacy-policy" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-4xl">
          <header className="text-center">
            <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Privacy Policy</p>
            <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
              개인정보처리방침
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              스트룸은 이용자의 개인정보를 소중하게 생각하며 관련 법령을 준수합니다.
            </p>
          </header>

          <section className="relative mx-auto mt-10 w-full max-w-4xl rounded-3xl p-6 liquid-glass sm:p-8">
            <div className="space-y-6">
              {policySections.map((section) => (
                <article key={section.title} className="space-y-3">
                  <h2 className="text-lg font-semibold text-hero-heading sm:text-xl">{section.title}</h2>
                  <ul className="space-y-2 text-sm leading-7 text-foreground/80 sm:text-base">
                    {section.items.map((item) => (
                      <li key={item} className="pl-3">
                        - {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}

              <div className="rounded-2xl border border-white/15 bg-black/15 px-4 py-3 text-sm text-foreground/70 sm:text-base">
                시행일자: 2026년 4월 14일
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
