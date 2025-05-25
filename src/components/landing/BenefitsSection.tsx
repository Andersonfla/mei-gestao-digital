
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Shield } from "lucide-react";

const benefits = [
  {
    icon: Calculator,
    title: "Organize suas finanças",
    description: "Mantenha controle total de receitas e despesas com interface simples e intuitiva."
  },
  {
    icon: TrendingUp,
    title: "Aumente seus lucros",
    description: "Visualize tendências e tome decisões inteligentes baseadas em dados reais."
  },
  {
    icon: Shield,
    title: "Conformidade garantida",
    description: "Mantenha-se em dia com as obrigações fiscais do MEI de forma automatizada."
  }
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher o MEI Finanças?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simplifique sua gestão financeira e foque no que realmente importa: fazer seu negócio crescer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
