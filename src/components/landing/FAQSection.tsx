import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O MEI Finanças é seguro?",
    answer: "Sim, totalmente. Seus dados são protegidos com criptografia de ponta a ponta. Utilizamos os mais altos padrões de segurança da indústria para garantir que suas informações financeiras estejam sempre protegidas. Sua privacidade é nossa prioridade máxima.",
  },
  {
    question: "Posso usar no celular?",
    answer: "Com certeza! O MEI Finanças é 100% responsivo e funciona perfeitamente em qualquer dispositivo - celular, tablet ou computador. Você pode gerenciar suas finanças de onde estiver, a qualquer momento.",
  },
  {
    question: "O que acontece com meus dados se eu cancelar?",
    answer: "Você mantém total controle sobre seus dados. Antes de cancelar, você pode exportar todos os seus relatórios e informações. Após o cancelamento, seus dados ficam armazenados de forma segura por 30 dias, caso queira retornar. Depois desse período, eles são permanentemente removidos de nossos servidores.",
  },
  {
    question: "Como funciona o suporte prioritário do plano Premium?",
    answer: "Assinantes Premium têm acesso a um canal de suporte exclusivo com tempo de resposta reduzido. Nossa equipe está disponível para ajudar você com qualquer dúvida ou necessidade, garantindo que seu negócio funcione sem interrupções.",
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade para o plano Premium ou voltar para o plano Gratuito quando quiser, sem burocracia. As mudanças são aplicadas imediatamente, e você tem total flexibilidade para escolher o melhor momento.",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o MEI Finanças
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
