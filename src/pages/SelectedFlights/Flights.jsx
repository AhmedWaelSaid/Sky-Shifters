import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function Flights() {
  // لم يعد هناك حاجة لتخزين flight هنا أو تمريره عبر Outlet
  return <Outlet />;
}
