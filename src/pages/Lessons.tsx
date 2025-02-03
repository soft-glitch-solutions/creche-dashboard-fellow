import React from "react";

const Lessons = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold text-primary">Lessons</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3">Time</th>
              <th className="border border-gray-300 p-3">Monday</th>
              <th className="border border-gray-300 p-3">Tuesday</th>
              <th className="border border-gray-300 p-3">Wednesday</th>
              <th className="border border-gray-300 p-3">Thursday</th>
              <th className="border border-gray-300 p-3">Friday</th>
            </tr>
          </thead>
          <tbody>
            {[
              "8:00 AM - 9:00 AM",
              "9:00 AM - 10:00 AM",
              "10:00 AM - 11:00 AM",
              "11:00 AM - 12:00 PM",
              "1:00 PM - 2:00 PM",
              "2:00 PM - 3:00 PM",
            ].map((time) => (
              <tr key={time}>
                <td className="border border-gray-300 p-3 font-medium">{time}</td>
                <td className="border border-gray-300 p-3">Math</td>
                <td className="border border-gray-300 p-3">Science</td>
                <td className="border border-gray-300 p-3">History</td>
                <td className="border border-gray-300 p-3">English</td>
                <td className="border border-gray-300 p-3">Art</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lessons;