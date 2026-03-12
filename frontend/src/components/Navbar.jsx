import { Link } from "react-router-dom";

function Navbar(){

return(

<div className="navbar">

<h2>Digital Queue System</h2>

<div className="nav-links">

<Link to="/">Customer</Link>

<Link to="/display">Display</Link>

<Link to="/panel">Operator</Link>




</div>

</div>

);

}

export default Navbar;