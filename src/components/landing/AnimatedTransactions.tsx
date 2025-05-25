
import { motion } from "framer-motion";

const transactions = [
  { hora: "09:00", desc: "Venda no cartão", valor: "R$ 150,00", tipo: "entrada", status: "confirmado" },
  { hora: "10:00", desc: "Compra de material", valor: "R$ 50,00", tipo: "saida", status: "confirmado" },
  { hora: "11:00", desc: "Pagamento de serviço", valor: "R$ 30,00", tipo: "saida", status: "pendente" },
  { hora: "14:00", desc: "Recebimento via PIX", valor: "R$ 200,00", tipo: "entrada", status: "confirmado" },
  { hora: "15:00", desc: "Venda à vista", valor: "R$ 85,00", tipo: "entrada", status: "confirmado" },
];

export function AnimatedTransactions() {
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
      
      <div className="space-y-4">
        {transactions.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
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
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                className="text-sm font-semibold bg-primary/10 px-2 py-1 rounded"
              >
                {item.hora}
              </motion.div>
              <div>
                <div className="font-medium">{item.desc}</div>
                <motion.div 
                  className={`text-sm font-semibold ${
                    item.tipo === "entrada" ? "text-green-600" : "text-red-600"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                >
                  {item.tipo === "entrada" ? "+" : "-"}{item.valor}
                </motion.div>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
              className={`w-3 h-3 rounded-full ${
                item.status === "confirmado" ? "bg-green-500" : "bg-blue-400"
              }`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
