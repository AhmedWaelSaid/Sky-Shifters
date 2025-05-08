import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
    const navigate=useNavigate()
    return (
        <>
            <h1>Invalid URL please go back home and try again!</h1>
            <button onClick={()=> navigate("/")}>Home</button>
        </>
    );
}