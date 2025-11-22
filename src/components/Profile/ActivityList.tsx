import React from "react";
import { IconClock } from "@tabler/icons-react";

interface Activity {
  id: string | number;
  icon: React.ElementType;
  action: string;
  target: string;
  time: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div
          key={act.id}
          className="flex items-center justify-between p-3 border-l-4 border-indigo-300 bg-gray-100 rounded-r-lg hover:bg-gray-200 transition"
        >
          <div className="flex items-center gap-3">
            <act.icon size={18} className="text-indigo-600" />
            <p className="text-sm text-gray-800">
              Bạn đã <span className="font-semibold">{act.action}</span>:{" "}
              <span className="font-medium text-indigo-800">{act.target}</span>
            </p>
          </div>
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <IconClock size={12} /> {act.time}
          </span>
        </div>
      ))}

      <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 transition font-medium pt-2">
        Xem tất cả hoạt động
      </button>
    </div>
  );
};

export default ActivityList;
