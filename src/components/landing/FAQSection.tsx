import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como acesso minhas informações?",
    answer: "O acesso à sua conta é feito com email e senha. Não compartilhe sua senha. Em caso de dúvida sobre sua conta, entre em contato pelo canal de suporte.",
  },
  {
    question: "Posso usar no celular?",
    answer: "Você pode acessar pelo navegador do celular ou do computador. Também há a opção de instalar o app pelo menu Instalar App.",
  },
  {
    question: "Posso exportar meus relatórios?",
    answer: "O plano Premium permite exportar relatórios em PDF. O Premium Master também oferece exportações em CSV e Excel. A exportação fica na página Relatórios e depende de um plano ativo.",
  },
  {
    question: "Como funciona o suporte prioritário do plano Premium?",
    answer: "Premium e Premium Master têm acesso ao canal de suporte prioritário dentro da conta. O formulário público de suporte continua disponível para todos.",
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Na página Planos da sua conta, você pode consultar seu plano atual e as opções de assinatura. Os recursos pagos dependem da confirmação do pagamento e de uma assinatura ativa.",
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
