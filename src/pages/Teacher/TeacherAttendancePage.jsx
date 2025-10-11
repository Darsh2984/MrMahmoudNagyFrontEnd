import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherSidebar from "../../components/TeacherSidebar";
import GroupSessions from "../../components/GroupSessions";
import SessionAttendance from "../../components/SessionAttendance";
import CreateSessionForm from "../../components/CreateSessionForm";
import {
  Users,
  CalendarPlus,
  ListChecks,
  UserList,
} from "phosphor-react";
import "./TeacherAttendancePage.css";

export default function TeacherAttendancePage() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (id) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${id}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
    }
  };

  return (
    <div className={`page-layout ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="attendance-container">
        {/* === Create Session === */}
        <div className="section-card">
          <h2 className="page-title">
            <CalendarPlus size={26} weight="fill" color="#0b3c49" />
            Create New Session
          </h2>
          <CreateSessionForm
            teacherId={teacherId}
            years={years}
            onSessionCreated={(groupId, session) => {
              setSelectedGroup(groupId);
              setActiveSessionId(session._id);
            }}
          />
        </div>

        {/* === Group Selector === */}
        <div className="section-card">
          <h3 className="card-title">
            <Users size={24} weight="fill" color="#d77e42" />
            View Group Sessions
          </h3>
          <select
            className="styled-select"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setActiveSessionId(null);
            }}
          >
            <option value="">-- Select Group --</option>
            {years.flatMap((y) =>
              y.groups?.map((g) => (
                <option key={g._id} value={g._id}>
                  {y.name} - {g.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* === Group Sessions === */}
        {selectedGroup && (
          <div className="section-card">
            <h3 className="card-title">
              <ListChecks size={24} weight="fill" color="#8baa91" />
              Group Sessions
            </h3>
            <GroupSessions
              groupId={selectedGroup}
              onSelectSession={(sessionId) => setActiveSessionId(sessionId)}
            />
          </div>
        )}

        {/* === Attendance Table === */}
        {activeSessionId && (
          <div className="section-card">
            <h3 className="card-title">
              <UserList size={24} weight="fill" color="#c85d47" />
              Session Attendance
            </h3>
            <SessionAttendance sessionId={activeSessionId} />
          </div>
        )}
      </main>
    </div>
  );
}
