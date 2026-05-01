"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-posta veya şifre hatalı.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Pişti.
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Hoş geldin</h1>
          <p className={styles.subtitle}>Admin paneline giriş yap</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {registered && (
            <p className={styles.success}>
              Kayıt başarılı! Şimdi giriş yapabilirsin.
            </p>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : "Giriş Yap"}
          </button>
        </form>

        <p className={styles.footer}>
          Hesabın yok mu?{" "}
          <Link href="/register" className={styles.link}>
            Kayıt ol
          </Link>
        </p>
      </div>

      {/* Decorative background element */}
      <div className={styles.bgDot} aria-hidden="true" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
