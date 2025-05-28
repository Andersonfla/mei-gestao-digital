
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CreditCard, ShoppingCart, Wrench, Banknote, HandCoins } from "lucide-react";

const baseTransactions = [
  { hora: "09:00", desc: "Venda no cartão", valor: "R$ 150,00", tipo: "entrada", status: "confirmado", icone: CreditCard },
  { hora: "10:00", desc: "Compra de material", valor: "R$ 50,00", tipo: "saida", status: "confirmado", icone: ShoppingCart },
  { hora: "11:00", desc: "Pagamento de serviço", valor: "R$ 30,00", tipo: "saida", status: "pendente", icone: Wrench },
  { hora: "14:00", desc: "Recebimento via PIX", valor: "R$ 200,00", tipo: "entrada", status: "confirmado", icone: Banknote },
  { hora: "15:00", desc: "Venda à vista", valor: "R$ 85,00", tipo: "entrada", status: "confirmado", icone: HandCoins },
  { hora: "16:00", desc: "Compra de estoque", valor: "R$ 120,00", tipo: "saida", status: "confirmado", icone: ShoppingCart },
  { hora: "17:00", desc: "Venda online", valor: "R$ 75,00", tipo: "entrada", status: "confirmado", icone: CreditCard },
  { hora: "18:00", desc: "Manutenção equipamento", valor: "R$ 40,00", tipo: "saida", status: "pendente", icone: Wrench },
];

export function AnimatedTransactions() {
  const [visibleTransactions, setVisibleTransactions] = useState(baseTransactions.slice(0, 4));
  const [nextIndex, setNextIndex] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleTransactions(prev => {
        const newTransactions = [...prev];
        // Remove o primeiro (mais antigo)
        newTransactions.shift();
        // Adiciona um novo no final
        const nextTransaction = baseTransactions[nextIndex % baseTransactions.length];
        newTransactions.push({
          ...nextTransaction,
          id: Date.now() + Math.random(), // ID único para animação
        });
        return newTransactions;
      });
      
      setNextIndex(prev => (prev + 1) % baseTransactions.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [nextIndex]);

  return (
    <div className="md:w-1/2 p-10 bg-white rounded-lg shadow-md mx-5 my-10 md:my-20">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl font-bold mb-6"
      >
        Lançamentos de Maio
      </motion.h2>
      
      <div className="space-y-4 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleTransactions.map((item, index) => {
            const IconeComponent = item.icone;
            return (
              <motion.div
                key={item.id || `${item.hora}-${index}`}
                layout
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -60, 
                  scale: 0.8,
                  transition: { 
                    duration: 0.4,
                    ease: "easeIn"
                  }
                }}
                whileHover={{ 
                  scale: 1.02, 
                  transition: { duration: 0.2 }
                }}
                className="flex justify-between items-center p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-sm font-semibold bg-primary/10 px-2 py-1 rounded"
                  >
                    {item.hora}
                  </motion.div>
                  <div className="flex items-center gap-3">
                    <IconeComponent className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{item.desc}</div>
                      <motion.div 
                        className={`text-sm font-semibold ${
                          item.tipo === "entrada" ? "text-green-600" : "text-red-600"
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        {item.tipo === "entrada" ? "+" : "-"}{item.valor}
                      </motion.div>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className={`w-3 h-3 rounded-full ${
                    item.status === "confirmado" ? "bg-green-500" : "bg-blue-400"
                  }`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
