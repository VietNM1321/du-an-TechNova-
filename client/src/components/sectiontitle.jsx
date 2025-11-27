import React from "react";

function SectionTitle({ icon, title, color = "text-blue-600" }) {
  return (
    <h2
      className={`text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 ${color}`}
    >
      <span className="text-3xl">{icon}</span> {title}
    </h2>
  );
}

export default SectionTitle;