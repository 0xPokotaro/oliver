"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth";

type LoginFormValues = {
  email: string;
  otp: string;
};

const STEP = {
  EMAIL: "email",
  OTP: "otp",
} as const;

const MESSAGES = {
  EMAIL_STEP: "Enter your email address to receive a one-time password.",
  OTP_STEP: "Enter the one-time password sent to your email.",
} as const;

const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid email address",
  OTP_REQUIRED: "OTP is required",
} as const;

/**
 * エラー配列をFieldErrorコンポーネントが期待する形式に変換
 */
const mapFieldErrors = (
  errors: unknown[],
): Array<{ message?: string } | undefined> =>
  errors.map((error) =>
    typeof error === "string" ? { message: error } : error,
  ) as Array<{ message?: string } | undefined>;

/**
 * メールアドレスのバリデーション
 */
const validateEmail = (value: string): string | undefined => {
  if (!value) return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return VALIDATION_MESSAGES.EMAIL_INVALID;
  return undefined;
};

/**
 * OTPのバリデーション
 */
const validateOtp = (value: string): string | undefined => {
  if (!value) return VALIDATION_MESSAGES.OTP_REQUIRED;
  return undefined;
};

/**
 * ログイン状態に基づいて現在のステップ（メール入力 or OTP入力）を判定
 */
const getCurrentStep = (
  status: string,
): typeof STEP.EMAIL | typeof STEP.OTP => {
  return status === "initial" || status === "error" ? STEP.EMAIL : STEP.OTP;
};

/**
 * フォームがローディング中かどうかを判定
 */
const isFormLoading = (status: string, isSubmitting: boolean): boolean => {
  return (
    status === "sending-code" || status === "submitting-code" || isSubmitting
  );
};

export const SignInForm = () => {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

  const {
    sendCode,
    loginWithCode,
    state: loginState,
  } = useLoginWithEmail({
    onComplete: () => {
      router.push("/");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      otp: "",
    } satisfies LoginFormValues,
    onSubmit: async ({ value }) => {
      if (loginState.status === "initial" || loginState.status === "error") {
        await sendCode({ email: value.email });
      } else if (loginState.status === "awaiting-code-input") {
        await loginWithCode({ code: value.otp });
      }
    },
  });

  // 既に認証されている場合はリダイレクト
  useEffect(() => {
    if (ready && authenticated && user) {
      router.push("/");
    }
  }, [ready, authenticated, user, router]);

  // Privyが準備できていない場合はローディング表示
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-[425px]">
          <CardContent>
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 既に認証されている場合はリダイレクト
  if (authenticated) {
    return null;
  }

  const currentStep = getCurrentStep(loginState.status);
  const isLoading = isFormLoading(loginState.status, form.state.isSubmitting);
  const errorMessage =
    loginState.status === "error" ? loginState.error?.message : null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-[425px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              {currentStep === STEP.EMAIL
                ? MESSAGES.EMAIL_STEP
                : MESSAGES.OTP_STEP}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {errorMessage && (
                <div className="text-destructive text-sm">{errorMessage}</div>
              )}
              {currentStep === STEP.EMAIL ? (
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => validateEmail(value),
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                      {field.state.meta.errors && (
                        <FieldError
                          errors={mapFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  )}
                </form.Field>
              ) : (
                <>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input value={form.state.values.email} readOnly disabled />
                  </Field>
                  <form.Field
                    name="otp"
                    validators={{
                      onChange: ({ value }) => validateOtp(value),
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          One-Time Password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="text"
                          placeholder="Enter OTP"
                          disabled={isLoading}
                        />
                        {field.state.meta.errors && (
                          <FieldError
                            errors={mapFieldErrors(field.state.meta.errors)}
                          />
                        )}
                      </Field>
                    )}
                  </form.Field>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : currentStep === STEP.EMAIL
                  ? "Send OTP"
                  : "Verify"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
