"use client";

import Link from "next/link";
import { User as UserIcon, ShieldCheck } from "lucide-react";
import { forwardRef } from "react";
import type { User } from "next-auth";
import styles from "./Navbar.module.css";

interface NavbarProps {
  user?: User | null;
}

const Navbar = forwardRef<HTMLDivElement, NavbarProps>(({ user }, ref) => {
  const role = user?.role;

  return (
    <nav className={styles.navbar} ref={ref}>
      <Link href="/" className={styles.logo}>
        Pişti.
      </Link>

      <div className={styles.actions}>
        {!user && (
          <Link href="/login" className={`btn btn-outline ${styles.actionBtn}`}>
            <UserIcon size={16} />
            Giriş Yap
          </Link>
        )}

        {user && role === "admin" && (
          <Link href="/admin" className={`btn btn-outline ${styles.actionBtn}`}>
            <ShieldCheck size={16} />
            Admin
          </Link>
        )}

        {user && role === "user" && (
          <Link
            href="/profile"
            className={`btn btn-outline ${styles.actionBtn}`}
          >
            <span className={styles.avatar}>
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
            {user.name?.split(" ")[0]}
          </Link>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
