import Link from "next/link";

import { signupAction } from "@/app/(auth)/actions";
import { FeedbackAlert } from "@/components/atoms/feedback-alert";
import { SignupForm } from "@/components/organisms/signup-form";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, success } = await searchParams;

  return (
    <main className="space-y-6 text-foreground">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <p className="text-sm text-foreground/70">
          스트룸과 함께 성장해보세요.
        </p>
      </header>
      {error ? (
        <FeedbackAlert variant="error" title="회원가입에 실패했습니다." description={error} />
      ) : null}
      {success ? (
        <FeedbackAlert variant="success" title="안내" description={success} />
      ) : null}
      <SignupForm action={signupAction} />
      <p className="text-center text-sm text-foreground/72">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="px-0 text-sm font-medium text-hero-heading underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
