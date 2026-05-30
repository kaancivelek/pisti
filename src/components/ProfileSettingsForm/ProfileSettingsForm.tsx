"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User as AuthUser } from "next-auth";
import styles from "./ProfileSettingsForm.module.css";

type Tab = "info" | "password" | "danger";

interface ProfileSettingsFormProps {
  currentUser: AuthUser;
}

export default function ProfileSettingsForm({ currentUser }: ProfileSettingsFormProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("info");

  // Info form
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync form values when session loads/changes
  const sessionName = currentUser.name || "";
  const sessionEmail = currentUser.email || "";
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync session data into form fields
  useEffect(() => {
    setName(sessionName);
    setEmail(sessionEmail);
  }, [sessionName, sessionEmail]);

  const clearSuccess = (setter: (v: boolean) => void) => {
    setTimeout(() => setter(false), 3000);
  };

  // ─── Info Update ───
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoError(null);
    setInfoSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");

      // Refresh server state to update session
      router.refresh();
      setInfoSuccess(true);
      clearSuccess(setInfoSuccess);
    } catch (err: unknown) {
      setInfoError(err instanceof Error ? err.message : "Güncelleme başarısız.");
    } finally {
      setInfoLoading(false);
    }
  };

  // ─── Password Update ───
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Şifre güncellenemedi.");

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      clearSuccess(setPwSuccess);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    } finally {
      setPwLoading(false);
    }
  };

  // ─── Delete Account ───
  const handleDelete = async () => {
    if (deleteConfirm !== currentUser.email) {
      setDeleteError("E-posta adresi eşleşmiyor.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Hesap silinemedi.");
      }
      await signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Hesap silinemedi.");
      setDeleteLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Bilgilerimi Düzenle" },
    { key: "password", label: "Şifre Değiştir" },
    { key: "danger", label: "Tehlikeli Bölge" },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Sub-tabs */}
      <div className={styles.subTabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.subTabBtn} ${activeTab === t.key ? styles.subTabActive : ""} ${t.key === "danger" ? styles.dangerTab : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {activeTab === "info" && (
        <form className={styles.form} onSubmit={handleInfoSubmit}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Kişisel Bilgiler</h3>
                <p className={styles.cardDesc}>Ad ve e-posta adresinizi güncelleyin.</p>
              </div>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-name">Ad Soyad</label>
                <input
                  id="profile-name"
                  className={styles.input}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  required
                  minLength={2}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-email">E-posta</label>
                <input
                  id="profile-email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {infoError && <StatusMsg type="error" message={infoError} />}
            {infoSuccess && <StatusMsg type="success" message="Bilgileriniz başarıyla güncellendi!" />}

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={infoLoading}
              >
                {infoLoading ? <><span className={styles.btnSpinner} />Kaydediliyor...</> : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── PASSWORD TAB ── */}
      {activeTab === "password" && (
        <form className={styles.form} onSubmit={handlePasswordSubmit}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Şifre Değiştir</h3>
                <p className={styles.cardDesc}>Hesap güvenliğiniz için güçlü bir şifre seçin.</p>
              </div>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="current-password">Mevcut Şifre</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="current-password"
                    className={styles.input}
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut şifreniz"
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrentPw((v) => !v)}>
                    {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-password">Yeni Şifre</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="new-password"
                    className={styles.input}
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPw((v) => !v)}>
                    {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm-password">Yeni Şifre (Tekrar)</label>
                <input
                  id="confirm-password"
                  className={`${styles.input} ${confirmPassword && confirmPassword !== newPassword ? styles.inputError : ""}`}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifreyi tekrar girin"
                  required
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className={styles.fieldError}>Şifreler eşleşmiyor.</p>
                )}
              </div>
            </div>

            {pwError && <StatusMsg type="error" message={pwError} />}
            {pwSuccess && <StatusMsg type="success" message="Şifreniz başarıyla güncellendi!" />}

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={pwLoading}
              >
                {pwLoading ? <><span className={styles.btnSpinner} />Güncelleniyor...</> : "Şifreyi Güncelle"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── DANGER TAB ── */}
      {activeTab === "danger" && (
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={`${styles.cardTitle} ${styles.dangerTitle}`}>Hesabı Sil</h3>
              <p className={styles.cardDesc}>Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecek.</p>
            </div>
          </div>

          <div className={styles.dangerZone}>
            <p className={styles.dangerHint}>
              Onaylamak için e-posta adresinizi yazın: <strong>{currentUser.email}</strong>
            </p>
            <input
              className={`${styles.input} ${styles.dangerInput}`}
              type="email"
              placeholder={currentUser.email || ""}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>

          {deleteError && <StatusMsg type="error" message={deleteError} />}

          <div className={styles.formFooter}>
            <button
              className={`btn ${styles.deleteAccountBtn}`}
              onClick={handleDelete}
              disabled={deleteLoading || deleteConfirm !== currentUser.email}
            >
              {deleteLoading ? <><span className={styles.btnSpinner} />Siliniyor...</> : "Hesabımı Kalıcı Olarak Sil"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini components ───

function StatusMsg({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`${styles.statusMsg} ${type === "success" ? styles.statusSuccess : styles.statusError}`}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className={styles.strengthWrapper}>
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={styles.strengthBar}
            style={{ background: i <= score ? colors[score] : "var(--border-color)" }}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
