import RegionStore from "@/store/RegionStore";
import React from "react";

const RegionSelecter = ({ region, setRegion }) => {
  return (
    <select
      id="lang"
      value={region}
      onChange={(e) => setRegion(e.target.value)}
      className="border border-slate-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 px-6 py-2 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option>Choose Language</option>
      <option value={"en"}>English</option>
      <option value={"de"}>German</option>
    </select>
  );
};

export default RegionSelecter;
