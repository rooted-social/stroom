import { WaitingListForm } from "@/components/organisms/waiting-list-form";
import { LandingNavbar } from "@/components/templates/landing-navbar";

export default function WaitingListPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/waitinglist" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-5xl">
          <header className="text-center">
            <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Waiting List</p>
            <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
              서비스 대기 신청
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              베타 론칭 소식을 가장 먼저 받아보세요.
            </p>
          </header>

          <section className="relative mx-auto mt-10 w-full max-w-2xl rounded-3xl p-6 liquid-glass sm:p-8">
            <div className="mb-5 text-center">
              <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Beta Access</p>
              <h2 className="mt-2 text-2xl font-semibold text-hero-heading">대기 명단 등록</h2>
            </div>
            <WaitingListForm />
            <div className="mt-6 rounded-2xl border border-[#6EA9DD]/40 bg-[linear-gradient(135deg,rgba(110,169,221,0.18),rgba(58,123,191,0.1))] px-4 py-3 text-center shadow-[0_20px_40px_-28px_rgba(58,123,191,0.7)]">
              <p className="text-sm font-medium tracking-tight text-[#D9ECFF] sm:text-base">
                4월 중, 베타 서비스 오픈 소식을 대기자 분들에게 먼저 알려드릴게요.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
