import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const BenefitCard = ({ icon: Icon, title, description, delay = 0 }: BenefitCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex items-start space-x-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className="flex-shrink-0"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </motion.div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};