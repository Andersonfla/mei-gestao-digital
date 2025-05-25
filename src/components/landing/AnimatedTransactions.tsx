
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShoppingCart,
  Wrench,
  Banknote,
  HandCoins,
} from "lucide-react";

const lancamentos = [
  {
    hora: "09:00",
    titulo: "Venda no cartão",
    valor: "+R$ 150,00",
    tipo: "entrada",
    icone: CreditCard,
  },
  {
    hora: "10:00",
    titulo: "Compra de material",
    valor: "-R$ 50,00",
    tipo: "saida",
    icone: ShoppingCart,
  },
  {
    hora: "11:00",
    titulo: "Pagamento de serviço",
    valor: "-R$ 30,00",
    tipo: "saida",
    icone: Wrench,
  },
  {
    hora: "14:00",
    titulo: "Recebimento via PIX",
    valor: "+R$ 200,00",
    tipo: "entrada",
    icone: Banknote,
  },
  {
    hora: "15:00",
    titulo: "Venda à vista",
    valor: "+R$ 85,00",
    tipo: "entrada",
    icone: HandCoins,
  },
];

export function AnimatedTransactions() {
  const [visibleTransactions, setVisibleTransactions] = useState([lancamentos[0]]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % lancamentos.length;
        const nextTransaction = lancamentos[nextIndex];
        
        setVisibleTransactions((prevVisible) => {
          const newVisible = [...prevVisible, nextTransaction];
          // Manter apenas os últimos 3 lançamentos visíveis
          return newVisible.slice(-3);
        });
        
        return nextIndex;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

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
      
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Últimos lançamentos</h3>
        <div className="space-y-3 overflow-hidden h-80">
          <AnimatePresence>
            {visibleTransactions.map((lancamento, index) => {
              const Icone = lancamento.icone;
              return (
                <motion.div
                  key={`${lancamento.hora}-${index}`}
                  initial={{ y: 40, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -40, opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between cursor-pointer"
                  whileHover={{ 
                    scale: 1.02, 
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-sm font-semibold bg-primary/10 px-2 py-1 rounded"
                  >
                    {lancamento.hora}
                  </motion.div>
                  
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Icone className="w-5 h-5 text-gray-500" />
                    </motion.div>
                    <div>
                      <div className="font-medium">{lancamento.titulo}</div>
                      <motion.div 
                        className={`text-sm font-semibold ${
                          lancamento.tipo === "entrada" ? "text-green-600" : "text-red-600"
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        {lancamento.valor}
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className={`w-3 h-3 rounded-full ${
                      lancamento.tipo === "entrada" ? "bg-green-500" : "bg-blue-400"
                    }`}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
