import { motion } from "framer-motion";
import { UserPlus, Receipt, BarChart3, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Crie sua conta em segundos",
    description: "Cadastro rápido e descomplicado. Em menos de um minuto você estará pronto para começar.",
  },
  {
    number: "2",
    icon: Receipt,
    title: "Lance suas receitas e despesas",
    description: "Adicione suas transações de forma simples e intuitiva. Organize suas finanças com poucos cliques.",
  },
  {
    number: "3",
    icon: BarChart3,
    title: "Visualize tudo no dashboard inteligente",
    description: "Acompanhe seus números em tempo real com gráficos claros e fáceis de entender.",
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Tome decisões com base em dados claros",
    description: "Tenha insights valiosos sobre seu negócio e cresça com segurança e planejamento.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Como Funciona?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples, você transforma a gestão financeira do seu negócio
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 mb-16 last:mb-0`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {step.description}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                  >
                    <Icon className="w-16 h-16 text-primary-foreground" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
