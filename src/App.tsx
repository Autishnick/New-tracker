import { Route, Routes } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import Calendar from "./components/Calendar";
import ControlPanel from "./components/ControlPanel";
import Tracker from "./components/Tracker";
function App() {
  return (
    <>
      <ControlPanel />
      <Routes>
        <Route path='/' element={<Tracker />}></Route>
        <Route path='/auth' element={<Auth />}></Route>
        <Route path='/calendar' element={<Calendar />}></Route>
      </Routes>
    </>
  );
}

export default App;
