import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
  return (
    <div style={{ width: "220px", background: "#111", color: "white", padding: "20px" }}>
      <h3>FleetOps</h3>

      {role === "Admin" && (
        <>
          <Link to="/admin" style={linkStyle}>Dashboard</Link>
          <Link to="/admin/users" style={linkStyle}>Manage Users</Link>
        </>
      )}

      {role === "FleetManager" && (
        <>
          <Link to="/fleet" style={linkStyle}>Dashboard</Link>
          <Link to="/fleet/drivers" style={linkStyle}>Drivers</Link>
        </>
      )}
    </div>
  );
};

const linkStyle = {
  display: "block",
  margin: "10px 0",
  color: "white",
  textDecoration: "none"
};

export default Sidebar;
