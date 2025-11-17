import { motion } from "framer-motion";
import { ShieldCheck, PieChart, Zap } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Segurança em Primeiro Lugar",
    description: "Seus dados são protegidos com criptografia de ponta. Sua privacidade e segurança são nossa prioridade máxima.",
  },
  {
    icon: PieChart,
    title: "Dashboard Intuitivo",
    description: "Visualize suas finanças em tempo real com gráficos claros e relatórios que fazem sentido para o seu negócio.",
  },
  {
    icon: Zap,
    title: "Simplicidade que Economiza Tempo",
    description: "Feito para o MEI que não tem tempo a perder. Lance suas transações e organize tudo em segundos.",
  },
];

export const NewBenefitsSection = () => {
  return (
    <section id="beneficios" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Por que escolher o MEI Finanças?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido especialmente para MEIs que buscam simplicidade, segurança e resultados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
