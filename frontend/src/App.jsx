import Chatbot from "./Pages/Chatbot"
import Error404 from "./Pages/Error404";
import Login from "./Pages/Login"
import {BrowserRouter,Route,Routes,Navigate} from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chatbot" element={<Chatbot/>}/>
        <Route path="/" element={<Navigate to="/chatbot"/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="*" element={<Error404/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
