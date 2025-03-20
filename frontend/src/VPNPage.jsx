import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { createNoise2D } from "simplex-noise"
import { useNavigate } from "react-router-dom"
import ConnectionIssueModal from "./ConnectionIssueModal.jsx"
import API_BASE_URL from "./config.js"

const { ipcRenderer } = window.require("electron")

export default function VPNPage() {
  const [status, setStatus] = useState("disconnected")
  const [wgIP, setWgIP] = useState("Not Connected")
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [normalip, setIp] = useState("")

  useEffect(() => {

    const checkAuth = async () => {
      const res = await fetch(`${API_BASE_URL}/auth/checkAuth`, {credentials: "include"})
      const data = await res.json()
      if(!data.success) navigate("/login")
    }

    const fetchIP = async () => {
      const res = await fetch(`${API_BASE_URL}/get-wg-ip`, {credentials: "include"})
      const data = await res.json()
      setIp(data.address)

    }

    checkAuth()
    fetchIP()

  },[ navigate ])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const noise = createNoise2D()
    const particles = new Array(100).fill().map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 1.5 - 0.75,
      speedY: Math.random() * 1.5 - 0.75,
    }))

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
        
        let color = status === "connected" ? "rgba(34, 197, 94, 0.7)" : status === "connecting" ? "rgba(234, 179, 8, 0.7)" : "rgba(220, 38, 38, 0.7)"
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      requestAnimationFrame(animate)
    }
    animate()
  }, [status])

  const toggleVPN = async () => {

    const res = await fetch(`${API_BASE_URL}/auth/checkAuth`, { credentials: "include" })
    const data = await res.json()
    
    if (!data.success) {
      navigate("/login")
      return
    }

    if (status === "connected") {
      setStatus("disconnecting")
      ipcRenderer.send("run-python", "disconnect.py")
      setTimeout(() => {
        setStatus("disconnected")
        setWgIP("Not Connected")
      }, 200) 
    } else {
      setStatus("connecting")
      ipcRenderer.send("run-python", "connect.py")
      fetchWireGuardIP(10) 
    }
  }
  
  const fetchWireGuardIP = async (attempts) => {
    if (attempts <= 0) {
        setStatus("connection issue");
        setShowModal(true);
        return;
    }

    let ip = await ipcRenderer.invoke("get-wg-ip");
    let receivedBytes = await ipcRenderer.invoke("run-command", "wg");

    console.log("Received Bytes:", receivedBytes);
    console.log("Fetched IP:", ip);

    if (receivedBytes === 0) {
        setTimeout(() => fetchWireGuardIP(attempts - 1), 200);
        return;
    }

    if(ip === "Not Connected") {
      setWgIP(normalip)
    } else {
      setWgIP(ip)
    }

    setStatus("connected");
};
  

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 text-white relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-gray-700 max-w-sm w-full"
      >
        <div className="text-4xl font-extrabold mb-6 tracking-wide text-gray-100 leading-tight">VPN Connection</div>
        
        <motion.div 
          className="w-8 h-8 rounded-full shadow-md mb-6"
          animate={{ backgroundColor: status === "connected" ? "#22c55e" : status === "connecting" ? "#eab308" : "#dc2626", scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        <motion.button
          onClick={toggleVPN}
          className="w-44 h-44 rounded-full cursor-pointer text-2xl font-semibold shadow-lg flex items-center justify-center border border-transparent transition-all relative tracking-wide"
          whileTap={{ scale: 0.9 }}
          animate={{
            backgroundColor: status === "connected" ? "#22c55e" : status === "connecting" ? "#eab308" : "#dc2626",
          }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-transparent"
            animate={{
              borderImageSource: "linear-gradient(to right, rgba(255,255,255,0.5), transparent, rgba(255,255,255,0.5))",
              rotate: [0, 360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          {status === "connected" ? "Connected" : status === "connecting" ? "Connecting..." : "Connect"}
        </motion.button>
        
        <div className="text-lg text-gray-300 mt-6 flex flex-col items-center">
          <span className="text-gray-400 font-semibold tracking-wide">YOUR IP:</span>
          <motion.span 
            className="text-xl font-semibold px-6 py-3 mt-2 rounded-lg transition-all duration-300 tracking-wide" 
            animate={{ 
              backgroundColor: status === "connected" ? "rgba(34, 197, 94, 0.15)" : "transparent", 
              color: status === "connected" ? "#22c55e" : status === "connecting" ? "#eab308" : "#dc2626", 
              scale: status === "connected" ? 1.1 : 1 
            }}
          >
            {wgIP}
          </motion.span>
        </div>
      </motion.div>

            <ConnectionIssueModal isOpen={showModal} onClose={() => setShowModal(false)} />
            
    </div>
  )
}
