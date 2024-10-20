import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react'; // If you don't have lucide-react installed, you can use an alternative icon library
import '../assets/styles/Header.css'; // Assuming you use external CSS for styling

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="header bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <a href="/" className="flex-shrink-0">
            <img
              className="h-8 w-auto"
              src="/placeholder.svg"
              alt="Your Logo"
            />
          </a>

          {/* Login Button Section with Motion Effects */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <button className="login-button flex items-center space-x-2">
              <motion.div
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UserCircle className="h-5 w-5" />
              </motion.div>
              <span>Login</span>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
