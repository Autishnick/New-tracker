import { useNavigate } from "react-router-dom";
import auth from "../assets/auth.png";
function ControlPanel() {
  const navigate = useNavigate();
  const handleAuth = () => {
    navigate("/auth");
  };
  const handleHome = () => {
    navigate("/");
  };
  const handleCalendar = () => {
    navigate("/calendar");
  };
  return (
    <div className='w-full max-h-14 flex items-center justify-end h-screen'>
      <button className='pr-4' onClick={handleHome}>
        Home
      </button>
      <button className='pr-4' onClick={handleCalendar}>
        Calendar
      </button>
      <img src={auth} onClick={handleAuth} className='max-w-14 pr-4'></img>
    </div>
  );
}

export default ControlPanel;
