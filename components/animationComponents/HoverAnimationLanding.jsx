import { motion } from "framer-motion";

export const HoverAnimationLanding = ({ children }) => (
  <motion.div whileHover={{ scale: 1.5 }} whileTap={{ scale:2 }}>
    {children}
  </motion.div>
);
