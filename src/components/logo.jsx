import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import logoLight from "../assets/Asset 22@2x.png";
import logoDark from "../assets/Asset 24@2x.png";

export default function Logo() {
  const { theme } = useContext(ThemeContext);
  const logo = theme === "dark" ? logoDark : logoLight;
  return (
    <div className="logo">
      <img src={logo} alt="Logo" />
    </div>
  );
}
