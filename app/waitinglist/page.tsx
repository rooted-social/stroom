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

          <section className="relative mx-auto mt-10 w-full max-w-2xl">
            <div className="pointer-events-none absolute -inset-x-5 -inset-y-8 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(110,169,221,0.33),transparent_64%)] blur-2xl" />
            <div className="pointer-events-none absolute inset-x-8 -bottom-6 -z-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(58,123,191,0.34),transparent_72%)] blur-3xl" />
            <div className="relative rounded-3xl p-6 liquid-glass sm:p-8">
              <div className="mb-5 text-center">
                <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Beta Access</p>
                <h2 className="mt-2 text-2xl font-semibold text-hero-heading">대기 명단 등록</h2>
              </div>
              <WaitingListForm />
            </div>
          </section>

          <div className="mx-auto mt-4 w-full max-w-2xl text-center">
            <p className="inline-flex items-center rounded-full border border-[#6EA9DD]/45 bg-[linear-gradient(135deg,rgba(110,169,221,0.17),rgba(58,123,191,0.08))] px-4 py-2 text-sm font-medium tracking-tight text-[#D9ECFF] shadow-[0_16px_34px_-26px_rgba(58,123,191,0.8)] sm:text-base">
              ※ 추후 등록된 이메일로 회원가입 코드가 발송될 예정입니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
