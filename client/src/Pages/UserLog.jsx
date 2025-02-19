import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../components/Header";
import Report_Bug from "../components/Report_Bug";
import BlackBtn from "../components/Black_Btn";
import UserCardSm from "../components/User_card_sm";

const apiUrl = import.meta.env.VITE_API_URL;

function UserLog() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const { user, setUser, loading } = useContext(AuthContext);

  useEffect(() => {
    !loading && user.uid === 0 && navigate("/login");
    !loading && !user.isAdmin && navigate(-1);
  }, [user, loading, navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await axios.get(`${apiUrl}/users`);
        setUsers(result.data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((usr) => {
    const fullName = `${usr.fname} ${usr.lname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  function goToAdminDashboard() {
    navigate("/admin-dashboard");
  }

  return (
    <div className="w-screen min-h-screen flex justify-center items-center">
      <div className="flex flex-col justify-between items-center w-[80%] max-w-[30rem] mt-[3rem]">
        <Header message="Welcome to Admin" />
        <div className="flex flex-col w-full mb-[2rem]">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="tracking-wider font-bold text-[#636363] text-sm">
              Users
            </h3>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm w-[50%] bg-gray-300"
            />
          </div>
          {/* User List */}
          <div className="flex flex-col w-full max-h-[32rem] overflow-auto">
            <AnimatePresence>
              {filteredUsers.map((usr) => {
                return (
                  <UserCardSm
                    key={usr.uid}
                    uid={usr.uid}
                    user_name={usr.fname + " " + usr.lname}
                    user_noshow_count={usr.noshow_count}
                    user_skill_level={usr.user_level}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col w-full items-center">
          <Report_Bug />
          <BlackBtn onClick={goToAdminDashboard} text={"Back"} />
        </div>
      </div>
    </div>
  );
}

export default UserLog;
