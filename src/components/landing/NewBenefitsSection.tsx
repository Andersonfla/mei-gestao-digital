import { motion } from "framer-motion";
import { ArrowDownUp, PieChart, Receipt, FileText } from "lucide-react";

const benefits = [
  {
    icon: ArrowDownUp,
    title: "Quanto entrou e quanto saiu",
    description: "Acompanhe o total de receitas e despesas do mês no dashboard.",
  },
  {
    icon: PieChart,
    title: "Resultado do seu negócio",
    description: "Veja a diferença entre receitas e despesas do período: lucro ou prejuízo.",
  },
  {
    icon: Receipt,
    title: "Lançamentos organizados",
    description: "Registre data, valor e categoria para consultar suas receitas e despesas.",
  },
  {
    icon: FileText,
    title: "Relatórios para acompanhar",
    description: "Consulte os resultados por período. Exporte em PDF com Premium e também em CSV e Excel com Master.",
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
            Seus lançamentos reunidos para entender as finanças do seu MEI
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
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
