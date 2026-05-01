"use client";

import Link from "next/link";
import { User, ShieldCheck } from "lucide-react";
import { forwardRef } from "react";
import { useSession } from "next-auth/react";
import styles from "./Navbar.module.css";

const Navbar = forwardRef<HTMLDivElement>((props, ref) => {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <nav className={styles.navbar} ref={ref}>
      <Link href="/" className={styles.logo}>
        Pişti.
      </Link>

      <div className={styles.actions}>
        {!session && (
          <Link href="/login" className={`btn btn-outline ${styles.actionBtn}`}>
            <User size={16} />
            Giriş Yap
          </Link>
        )}

        {session && role === "admin" && (
          <Link href="/admin" className={`btn btn-outline ${styles.actionBtn}`}>
            <ShieldCheck size={16} />
            Admin
          </Link>
        )}

        {session && role === "user" && (
          <Link
            href="/profile"
            className={`btn btn-outline ${styles.actionBtn}`}
          >
            <span className={styles.avatar}>
              {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
            {session.user?.name?.split(" ")[0]}
          </Link>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
