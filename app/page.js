"use client";

import { useEffect, useState, useRef } from "react";
import {
  FaCar,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function Home() {
  const [session, setSession] = useState("free");
  const [data, setData] = useState({
    vehicleNo: "-",
    triggerTime: "-",
    contactNo: "-",
    policeStation: "-",
    district: "-",
    notificationTime: "-",
    unitID: "",
    phoneNumber: "",
  });

  const [remarks, setRemarks] = useState([]);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timeCounter, setTimeCounter] = useState(0);
  const intervalRef = useRef(null);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const resetCounter = () => {
    clearInterval(intervalRef.current);
    setTimeCounter(0);
    intervalRef.current = setInterval(() => setTimeCounter((prev) => prev + 1), 1000);
  };

  useEffect(() => {
    fetch("/api/remarks")
      .then((res) => res.json())
      .then(setRemarks)
      .catch(console.error);
  }, []);

  const getNotification = async () => {
    if (session === "busy") return;
    setSession("busy");
    try {
      const res = await fetch("/api/notification");
      const json = await res.json();
      if (json.status === "success") {
        setData({
          vehicleNo: json.data.vehicle_no,
          triggerTime: json.data.trigger_time,
          contactNo: json.data.contact_no,
          policeStation: json.data.police_station,
          district: json.data.district,
          notificationTime: json.data.trigger_time,
          unitID: json.data.unit_id,
          phoneNumber: json.data.contact_no,
        });
        resetCounter();
      } else {
        setFailed(true);
        setTimeout(() => setFailed(false), 5000);
      }
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 5000);
    }
  };

  useEffect(() => {
    const interval = setInterval(getNotification, 2000);
    return () => clearInterval(interval);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, selectedRemark, otherRemarks }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        setData({
          vehicleNo: "-",
          triggerTime: "-",
          contactNo: "-",
          policeStation: "-",
          district: "-",
          notificationTime: "-",
          unitID: "",
          phoneNumber: "",
        });
        setOtherRemarks("");
        setSelectedRemark("");
        setSession("free");
      } else {
        setFailed(true);
        setTimeout(() => setFailed(false), 5000);
        setSession("free");
      }
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 5000);
      setSession("free");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden p-4">
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
        {/* Left Column: Event Details */}
        <div className="w-1/3 bg-white shadow-lg rounded-lg p-6 border border-gray-300 overflow-auto">
          <h2 className="text-xl font-bold mb-4 text-green-700">Event Details</h2>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <FaCar className="text-green-500" />
              <span className="font-semibold w-32">Vehicle Number:</span>
              <span>{data.vehicleNo}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaClock className="text-yellow-500" />
              <span className="font-semibold w-32">Trigger Time:</span>
              <span>{data.triggerTime}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaPhone className="text-blue-500" />
              <span className="font-semibold w-32">Pilot Mobile:</span>
              <span>{data.contactNo}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="font-semibold w-32">Base Location:</span>
              <span>{data.policeStation}</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaCity className="text-purple-500" />
              <span className="font-semibold w-32">District:</span>
              <span>{data.district}</span>
            </li>
          </ul>
        </div>

        {/* Right Column: FRV Form + Map */}
        <div className="w-2/3 flex flex-col gap-4">
          {/* Small FRV Form on top */}
          <div className="h-1/4 bg-white shadow-lg rounded-lg p-4 border border-gray-300 overflow-auto">
            <div className="flex justify-between items-center mb-2 bg-yellow-400 p-2 rounded-lg shadow-md">
              <h2 className="text-lg font-bold">FRV Move Without Event</h2>
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
              />

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Map occupies remaining space */}
          <div className="flex-1 bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
            <h2 className="text-xl font-bold mb-2 p-4 text-blue-700 bg-gray-50 border-b border-gray-200">
              Vehicle Location
            </h2>
            <iframe
              src="https://rj.glovision.co/gvkrajasthan/php/tripMap.php?accountID=gvkrajasthan&vehicleID=RJ14PD7019&onlyidles=no"
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
