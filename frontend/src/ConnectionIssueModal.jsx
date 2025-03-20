import { motion } from "framer-motion";

const { ipcRenderer } = window.require("electron");

export default function ConnectionIssueModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    ipcRenderer.send("run-python", "disconnect.py");
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center border border-red-500"
      >
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm-.75 5.25a.75.75 0 011.5 0v5.5a.75.75 0 01-1.5 0v-5.5zM12 16.25a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Connection Problem</h2>
        <p className="text-gray-300">We couldn't establish a connection. Please check your network or try again.</p>
        <button 
          onClick={handleClose} 
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 transition-all rounded-lg font-semibold"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
