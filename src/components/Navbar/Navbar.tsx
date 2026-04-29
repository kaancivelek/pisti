import Link from "next/link";
import { User } from "lucide-react";
import { forwardRef } from "react";
import styles from "./Navbar.module.css";

const Navbar = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <nav className={styles.navbar} ref={ref}>
      <div className={styles.logo}>Pişti.</div>
      <Link href="/login" className={`btn btn-outline ${styles.adminBtn}`}>
        <User size={16} /> Admin
      </Link>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
