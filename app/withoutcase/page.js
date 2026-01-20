"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaCar,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function WithoutCase() {
  const router = useRouter();

  const [session, setSession] = useState("free");
  const [data, setData] = useState({
    vehicleNo: "-",
    speed: "-",
    lastAssigned: "-",
    recordTime: "-",
    triggerTime: "-",
    district: "-",
    location: "-",
    contactNo: "-",
  });

  const [remarks, setRemarks] = useState([]);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");
  const [expectedStop, setExpectedStop] = useState("");

  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timeCounter, setTimeCounter] = useState(0);

  const [user, setUser] = useState({ username: "-", userId: "-" });

  const intervalRef = useRef(null);
  const pollingRef = useRef(null);

  const activeVehicleRef = useRef("-");

  /* ---------------- AUTHENTICATION CHECK ---------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("user_id");

    // debug logs
    console.log("username:", username);
    console.log("userId:", userId);

    if (!username || !userId || username === "-" || userId === "-") {
      router.push("/login");
      return;
    }

    setUser({ username, userId });
  }, [router]);

  /* ---------------- TIMER ---------------- */

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const resetCounter = () => {
    clearInterval(intervalRef.current);
    setTimeCounter(0);
    intervalRef.current = setInterval(
      () => setTimeCounter((prev) => prev + 1),
      1000
    );
  };

  /* ---------------- LOAD REMARKS ---------------- */

  useEffect(() => {
    fetch("/api/remarks")
      .then((res) => res.json())
      .then((json) => setRemarks(json))
      .catch(console.error);
  }, []);

  /* ---------------- NOTIFICATION ---------------- */

  const getNotification = async () => {
    if (session === "busy" || activeVehicleRef.current !== "-") return;

    setSession("busy");

    try {
      const res = await fetch("/api/notification");
      const json = await res.json();

      if (json.status === "success" && json.data.length > 0) {
        const v = json.data[0];

        try {
          await fetch("/api/agentput", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agentId: user.userId,
              vehicleNo: v.Vehicle_Number,
            }),
          });
        } catch (agentErr) {
          console.error("agentput failed", agentErr);
        }

        activeVehicleRef.current = v.Vehicle_Number;

   setData({
  vehicleNo: v.Vehicle_Number,
  speed: v.Speed,

  // ✅ ISO for backend
  lastAssigned: new Date(v.last_assigned_time).toISOString(),
  recordTime: new Date(v.Rec_Time).toISOString(),
  triggerTime: new Date(v.Rec_Time).toISOString(),

  // display-only fields
  lastAssignedDisplay: new Date(v.last_assigned_time).toLocaleString(),
  recordTimeDisplay: new Date(v.Rec_Time).toLocaleString(),
  triggerTimeDisplay: new Date(v.Rec_Time).toLocaleString(),

  district: v.district_name,
  location: v.location_name,
  contactNo: v.contact_number,
});


        resetCounter();

        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSession("free");
    }
  };

  /* ---------------- START POLLING ONLY AFTER USER IS SET ---------------- */

  useEffect(() => {
    if (user.userId === "-" || user.username === "-") return;

    getNotification();
    pollingRef.current = setInterval(getNotification, 5000);

    return () => {
      clearInterval(pollingRef.current);
      clearInterval(intervalRef.current);
    };
  }, [user]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.vehicleNo === "-") return;

    try {
      const payload = {
        ...data,
        selectedRemark,
        otherRemarks,
        expectedStop,
        submittedBy: user.username,
        submittedById: user.userId,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.status === "success") {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);

        activeVehicleRef.current = "-";

        setData({
          vehicleNo: "-",
          speed: "-",
          lastAssigned: "-",
          recordTime: "-",
          triggerTime: "-",
          district: "-",
          location: "-",
          contactNo: "-",
        });

        setSelectedRemark("");
        setOtherRemarks("");
        setExpectedStop("");

        clearInterval(intervalRef.current);
        setTimeCounter(0);

        clearInterval(pollingRef.current);
        pollingRef.current = setInterval(getNotification, 3000);
      } else {
        setFailed(true);
        setTimeout(() => setFailed(false), 5000);
      }
    } catch (err) {
      console.error(err);
      setFailed(true);
      setTimeout(() => setFailed(false), 5000);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-hidden">
      {/* Alerts */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-xl bg-green-600 text-white p-4 rounded shadow-lg flex items-center space-x-2 animate-bounce">
          <FaCheckCircle size={24} />
          <span>Success! Submitted Successfully.</span>
        </div>
      )}
      {failed && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-xl bg-red-600 text-white p-4 rounded shadow-lg flex items-center space-x-2 animate-bounce">
          <FaTimesCircle size={24} />
          <span>Failed! Already Submitted.</span>
        </div>
      )}

      <div className="flex flex-1 gap-4">
        {/* Left Column */}
        <div className="w-1/4 bg-white shadow-lg rounded-lg p-6 border border-gray-300 overflow-auto">
          <h2 className="text-xl font-bold mb-4 text-green-700">
            Vehicle Details
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <FaCar className="text-green-500" />
              <span className="font-semibold w-32">Vehicle Number:</span>
              <span>{data.vehicleNo}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaClock className="text-yellow-500" />
              <span className="font-semibold w-32">Speed:</span>
              <span>{data.speed} km/h</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaClock className="text-yellow-500" />
              <span className="font-semibold w-32">Last Assigned:</span>
              <span>{data.lastAssigned}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaClock className="text-pink-500" />
              <span className="font-semibold w-32">Trigger Time:</span>
              <span>{data.triggerTime}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaClock className="text-blue-500" />
              <span className="font-semibold w-32">Record Time:</span>
              <span>{data.recordTime}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="font-semibold w-32">Base Location:</span>
              <span>{data.location}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaCity className="text-purple-500" />
              <span className="font-semibold w-32">District:</span>
              <span>{data.district}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaPhone className="text-blue-500" />
              <span className="font-semibold w-32">Pilot Mobile:</span>
              <span>{data.contactNo}</span>
            </li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="w-2/3 flex flex-col gap-4">
          <div className="h-1/3 bg-white shadow-lg rounded-lg p-4 border border-gray-300 overflow-auto">
            <div className="flex justify-between items-center mb-2 bg-yellow-400 p-2 rounded-lg shadow-md">
              <h2 className="text-lg font-bold">
                Ambulance Move Without Event
              </h2>
              <span className="text-red-700 font-extrabold text-xl tracking-wide">
                {formatTime(timeCounter)}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 text-sm">
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-300"
                value={selectedRemark}
                onChange={(e) => setSelectedRemark(e.target.value)}
                required
                disabled={data.vehicleNo === "-"}
              >
                <option value="">Select Remarks</option>
                {remarks.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300"
                placeholder="Other Remarks"
                value={otherRemarks}
                onChange={(e) => setOtherRemarks(e.target.value)}
                disabled={data.vehicleNo === "-"}
              />

              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-300"
                value={expectedStop}
                onChange={(e) => setExpectedStop(e.target.value)}
                disabled={data.vehicleNo === "-"}
                required
              />

              <button
                type="submit"
                disabled={data.vehicleNo === "-"}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold disabled:opacity-50"
              >
                Submit
              </button>
            </form>
          </div>

          <div className="flex-1 bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
            <h2 className="text-xl font-bold mb-2 p-4 text-blue-700 bg-gray-50 border-b border-gray-200">
              Vehicle Location
            </h2>
            {data.vehicleNo !== "-" ? (
              <iframe
                src={`https://rj.glovision.co/gvkrajasthan/php/tripMap.php?accountID=gvkrajasthan&vehicleID=${data.vehicleNo}&onlyidles=no`}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-semibold">
                Waiting for vehicle trigger...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
