
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  activeTab: "login" | "signup";
  children: ReactNode;
  footerText: string;
}

export const AuthLayout = ({ activeTab, children, footerText }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-[380px] shadow-2xl rounded-2xl backdrop-blur-md bg-white/95">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png"
                alt="MEI Finanças"
                className="w-16 h-16 mx-auto mb-2"
              />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              MEI Finanças
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Gerencie suas finanças de forma simples e eficiente 🚀
            </p>
          </CardHeader>
          <CardContent>
            {children}
            <p className="text-center text-sm text-gray-600 mt-4">
              {footerText}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
