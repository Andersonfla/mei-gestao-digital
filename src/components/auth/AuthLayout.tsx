
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BenefitCard } from "./BenefitCard";
import { TrendingUp, Shield, BarChart3, Smartphone } from "lucide-react";

interface AuthLayoutProps {
  activeTab: "login" | "signup";
  children: ReactNode;
  footerText: string;
}

export const AuthLayout = ({ activeTab, children, footerText }: AuthLayoutProps) => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Gestão Inteligente",
      description: "Controle completo das suas finanças com relatórios automáticos e insights valiosos para seu MEI."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia avançada e backups automáticos na nuvem."
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Visualize o crescimento do seu negócio com gráficos intuitivos e análises personalizadas."
    },
    {
      icon: Smartphone,
      title: "Acesso em Qualquer Lugar",
      description: "Use em qualquer dispositivo, a qualquer hora. Sua gestão financeira sempre à mão."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side - Benefits */}
            <div className="lg:col-span-4 space-y-6 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Transforme seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MEI</span>
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  A plataforma completa para gestão financeira de microempreendedores
                </p>
              </motion.div>
              
              <div className="space-y-4">
                {benefits.slice(0, 2).map((benefit, index) => (
                  <BenefitCard
                    key={benefit.title}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            </div>

            {/* Center - Auth Card */}
            <div className="lg:col-span-4 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="w-full max-w-md"
              >
                <Card className="shadow-2xl rounded-3xl backdrop-blur-md bg-white/95 border-0 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CardHeader className="text-center pt-8 pb-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png"
                          alt="MEI Finanças"
                          className="w-16 h-16 mx-auto mb-4"
                        />
                      </motion.div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        MEI Finanças
                      </CardTitle>
                      <p className="text-slate-600 text-sm mt-2">
                        Sua gestão financeira inteligente 🚀
                      </p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      {children}
                      <p className="text-center text-sm text-slate-500 mt-6">
                        {footerText}
                      </p>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            </div>

            {/* Right Side - More Benefits */}
            <div className="lg:col-span-4 space-y-6 hidden lg:block">
              <div className="space-y-4">
                {benefits.slice(2).map((benefit, index) => (
                  <BenefitCard
                    key={benefit.title}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    delay={(index + 2) * 0.2}
                  />
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center space-x-2 text-white/60 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Dados protegidos com SSL</span>
                </div>
                <div className="inline-flex items-center space-x-2 text-white/60 text-sm mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Mais de 10.000 MEIs confiam em nós</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
