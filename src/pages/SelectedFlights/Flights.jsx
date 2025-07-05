import { Outlet ,useLocation} from "react-router-dom";
import { useOutletContext } from "react-router-dom";

export default function Flights() {
  // لم يعد هناك حاجة لتخزين flight هنا أو تمريره عبر Outlet
  const location = useLocation();
  const context = useOutletContext();
  return <Outlet context={context}  key={location.key}/>;
}
