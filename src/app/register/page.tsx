"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Bir hata oluştu.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Sunucuya bağlanılamadı.");
      setLoading(false);
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
          <h1 className={styles.title}>Hesap oluştur</h1>
          <p className={styles.subtitle}>Admin erişimi için kayıt ol</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              İsim
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Adın Soyadın"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="En az 6 karakter"
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : "Kayıt Ol"}
          </button>
        </form>

        <p className={styles.footer}>
          Zaten hesabın var mı?{" "}
          <Link href="/login" className={styles.link}>
            Giriş yap
          </Link>
        </p>
      </div>

      <div className={styles.bgDot} aria-hidden="true" />
    </div>
  );
}
