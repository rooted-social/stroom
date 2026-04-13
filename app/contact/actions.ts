"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedInquiryTopics = new Set(["feature", "pricing", "partnership"]);

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function submitContactInquiryAction(formData: FormData) {
  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const phone = normalizeText(formData.get("phone"));
  const message = normalizeText(formData.get("message"));
  const topics = formData
    .getAll("topics")
    .map((topic) => String(topic))
    .filter((topic) => allowedInquiryTopics.has(topic));

  if (!name || !email || !message || topics.length === 0) {
    redirect(`/contact?error=${encodeURIComponent("필수 항목을 모두 입력해주세요.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_inquiries").insert({
    user_id: user?.id ?? null,
    name,
    email,
    phone: phone || null,
    inquiry_topics: topics,
    message,
  });

  if (error) {
    redirect(`/contact?error=${encodeURIComponent("문의 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")}`);
  }

  redirect(`/contact?success=${encodeURIComponent("제출이 완료되었습니다")}`);
}
