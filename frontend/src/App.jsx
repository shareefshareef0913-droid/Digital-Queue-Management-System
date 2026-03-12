import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import QueueDisplay from "./pages/QueueDisplay";
import OperatorPanel from "./pages/OperatorPanel";
import Navbar from "./components/Navbar";
import "./styles/main.css";

function App(){

return(

<BrowserRouter>

<Navbar/>

<Routes>

<Route path="/" element={<CustomerPage/>} />

<Route path="/display" element={<QueueDisplay/>} />

<Route path="/panel" element={<OperatorPanel/>} />



</Routes>

</BrowserRouter>

);

}

export default App;