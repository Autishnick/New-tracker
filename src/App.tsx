import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import ControlPanel from "./components/ControlPanel";
import { useAuth } from "./context/useAuth";
import Calendar from "./pages/Calendar";
import Currencies from "./pages/Currencies";
import Tracker from "./pages/Tracker";
function App() {
  const { session } = useAuth();
  return (
    <>
      <ControlPanel />
      <Routes>
        <Route path='/' element={<Tracker session={session} />}></Route>
        <Route path='/auth' element={<Auth />}></Route>
        <Route
          path='/calendar'
          element={<Calendar session={session} />}
        ></Route>
        <Route
          path='/currencies'
          element={<Currencies session={session} />}
        ></Route>
      </Routes>
      <Toaster position='bottom-right' reverseOrder={false} />
    </>
  );
}

export default App;
