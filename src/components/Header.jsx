import './Header.css';
import Logo from "./logo"; // لاحظ أن الاسم يتطابق مع اسم الملف
import Navigation from './Navigation';


export default function Header() {
  return (
    <header className="header">
      <div className="logo">
       <Logo/>
      </div>

      <div className="Finds">
       <Navigation/>
      </div>

      <div className="signs">
        <a href="#" className="nav-link login">Login</a>
        <a href="#" className="nav-link sign-up">Sign Up</a>
      </div>
    </header>
  );
}
