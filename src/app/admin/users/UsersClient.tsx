"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Trash2, Shield, User as UserIcon } from "lucide-react";
import styles from "./Users.module.css";
import type { User as AuthUser } from "next-auth";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersClientProps {
  currentUser: AuthUser;
}

export default function UsersClient({ currentUser }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchTerm
        ? `/api/admin/users?search=${encodeURIComponent(searchTerm)}`
        : "/api/admin/users";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Kullanıcılar yüklenemedi.");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, fetchUsers]);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const targetRole = currentRole === "admin" ? "user" : "admin";
    
    if (userId === currentUser.id) {
      alert("Kendi rolünüzü değiştiremezsiniz!");
      return;
    }

    if (
      !confirm(
        `Bu kullanıcının rolünü "${targetRole.toUpperCase()}" yapmak istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Rol güncellenemedi.");
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: targetRole } : u))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert("Kendinizi silemezsiniz!");
      return;
    }

    if (!confirm(`"${userName}" isimli kullanıcıyı tamamen silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Kullanıcı silinemedi.");
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Kullanıcı Yönetimi</h1>
          <p>Sistemdeki tüm kayıtlı kullanıcıları gör, rollerini değiştir veya sil.</p>
        </div>
        <Link href="/admin" className={`btn btn-outline ${styles.backBtn}`}>
          <ArrowLeft size={16} />
          Paneline Dön
        </Link>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="İsim veya e-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.userCount}>
          Kayıtlı Kullanıcı Sayısı: <strong>{users.length}</strong>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Kullanıcılar yükleniyor...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={() => fetchUsers(search)}>
            Tekrar Dene
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Kayıt Tarihi</th>
                <th style={{ textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td data-label="Kullanıcı">
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {user.name} {user._id === currentUser.id && " (Siz)"}
                      </span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </td>
                  <td data-label="Rol">
                    <span
                      className={`${styles.roleBadge} ${
                        user.role === "admin" ? styles.roleAdmin : styles.roleUser
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Kullanıcı"}
                    </span>
                  </td>
                  <td data-label="Kayıt Tarihi">
                    <span className={styles.date}>
                      {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td data-label="İşlemler">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleRoleChange(user._id, user.role)}
                        disabled={updatingId === user._id || user._id === currentUser.id}
                        title={user.role === "admin" ? "Kullanıcı Rolüne Düşür" : "Admin Rolüne Yükselt"}
                      >
                        {updatingId === user._id ? (
                          <div className={styles.spinner} style={{ width: 16, height: 16, margin: 0 }} />
                        ) : user.role === "admin" ? (
                          <UserIcon size={16} />
                        ) : (
                          <Shield size={16} />
                        )}
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(user._id, user.name)}
                        disabled={deletingId === user._id || user._id === currentUser.id}
                        title="Kullanıcıyı Sil"
                      >
                        {deletingId === user._id ? (
                          <div className={styles.spinner} style={{ width: 16, height: 16, margin: 0 }} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
