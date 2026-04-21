"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getErrorRedirect(pathname: "/login" | "/signup", message: string) {
  return `${pathname}?error=${encodeURIComponent(message)}`;
}

function getSignupSuccessRedirect() {
  return `/login?successTitle=${encodeURIComponent("회원가입이 완료되었습니다.")}&successDescription=${encodeURIComponent("서비스 이용을 위하여 인증 메일을 확인해주세요!")}&ga_signup=1`;
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function isEmailFormat(value: string) {
  return value.includes("@");
}

function isValidUsername(value: string) {
  return /^[a-z0-9_]{4,20}$/.test(value);
}

function getFriendlyAuthErrorMessage(message: string) {
  if (message.includes("Invalid email or password")) {
    return "아이디(또는 이메일) 혹은 비밀번호가 일치하지 않습니다.";
  }
  if (message.includes("Invalid login credentials")) {
    return "입력한 계정 정보를 확인해주세요. 비밀번호가 일치하지 않거나 가입되지 않은 계정입니다.";
  }
  if (message.includes("Email not confirmed")) {
    return "이메일 인증이 아직 완료되지 않았습니다. 인증 메일을 확인해주세요.";
  }
  if (message.includes("Too many requests")) {
    return "요청이 많아 잠시 제한되었습니다. 잠시 후 다시 시도해주세요.";
  }
  if (message.includes("User already registered")) {
    return "이미 가입된 이메일 주소입니다. 로그인 또는 비밀번호 재설정을 이용해주세요.";
  }
  if (
    message.includes("profiles_username_key") ||
    message.toLowerCase().includes("duplicate key value")
  ) {
    return "이미 사용 중인 아이디입니다.";
  }

  return "요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

async function resolveEmailForLogin(identifier: string) {
  const normalized = identifier.trim();
  if (isEmailFormat(normalized)) {
    return {
      email: normalized,
      fromUsername: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_email_by_username", {
    p_username: normalizeUsername(normalized),
  });

  if (error || !data) {
    return null;
  }

  return {
    email: String(data),
    fromUsername: true,
  };
}

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!identifier || !password) {
    redirect(getErrorRedirect("/login", "아이디(또는 이메일)와 비밀번호를 입력해주세요."));
  }

  const loginTarget = await resolveEmailForLogin(identifier);
  if (!loginTarget) {
    redirect(
      getErrorRedirect(
        "/login",
        isEmailFormat(identifier)
          ? "가입된 이메일 주소를 찾을 수 없습니다."
          : "등록되지 않은 아이디입니다.",
      ),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: loginTarget.email,
    password,
  });

  if (error) {
    const message = getFriendlyAuthErrorMessage(error.message);
    redirect(
      getErrorRedirect(
        "/login",
        loginTarget.fromUsername
          ? `${message} (아이디: ${identifier})`
          : message,
      ),
    );
  }

  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();
  if (signedInUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status")
      .eq("id", signedInUser.id)
      .maybeSingle();

    if (profile?.account_status === "suspended") {
      await supabase.auth.signOut();
      redirect(getErrorRedirect("/login", "현재 운영자에 의해 정지된 계정입니다."));
    }

    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", signedInUser.id);
  }

  redirect("/dashboard?ga_login=1");
}

export async function signupAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "").trim();
  const privacyPolicyConsent = String(formData.get("privacyPolicyConsent") ?? "").trim();

  if (!fullName || !username || !email || !password || !passwordConfirm) {
    redirect(getErrorRedirect("/signup", "모든 항목을 입력해주세요."));
  }

  if (!isValidUsername(username)) {
    redirect(
      getErrorRedirect(
        "/signup",
        "아이디는 4~20자의 영문 소문자, 숫자, 밑줄(_)만 사용할 수 있습니다.",
      ),
    );
  }

  if (password.length < 6) {
    redirect(getErrorRedirect("/signup", "비밀번호는 6자 이상이어야 합니다."));
  }

  if (password !== passwordConfirm) {
    redirect(getErrorRedirect("/signup", "비밀번호 확인이 일치하지 않습니다."));
  }

  if (privacyPolicyConsent !== "on") {
    redirect(getErrorRedirect("/signup", "개인정보처리방침 동의가 필요합니다."));
  }

  const supabase = await createSupabaseServerClient();
  const { data: duplicated } = await supabase.rpc("get_email_by_username", {
    p_username: username,
  });
  if (duplicated) {
    redirect(getErrorRedirect("/signup", "이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요."));
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
      },
    },
  });

  if (error) {
    redirect(getErrorRedirect("/signup", getFriendlyAuthErrorMessage(error.message)));
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  redirect(getSignupSuccessRedirect());
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/login");
}
