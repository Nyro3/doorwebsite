import Link from "next/link";
import logo from "../img/logo.jpeg";
import HeaderAuth from "./HeaderAuth";

import "./heder.css"


function Header() {
  return ( <div className="header-container">
    <header className="header">
    <img src={logo.src} alt="Logo" className="logo" />
          <div className="text-container">
  <h1 className="main-title">معرض السلام</h1>
  <p className="sub-title">لتجارة الأبواب والشبابيك</p>
</div>

<Link href="/home" className="link">Home</Link>
<Link href="/about" className="link">About</Link>
<Link href="/Contact" className="link">Contact</Link>
<Link href="/shoping" className="link">Shopping</Link>

<HeaderAuth />

    </header>
  </div>);
}
export default Header;
