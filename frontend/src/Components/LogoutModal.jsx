import React from "react";

export default function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm  bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
        <h2 className="text-xl font-semibold mb-4">Log out?</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to log out?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
