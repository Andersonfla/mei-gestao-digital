-- Adicionar novas categorias premium de despesa
INSERT INTO public.categories (name, type, user_id) VALUES 
('Salários e Pró-Labore', 'saida', NULL),
('Despesas com Contabilidade/Jurídico', 'saida', NULL),
('Manutenção de Equipamentos/Softwares', 'saida', NULL),
('Custo de Aquisição de Cliente (CAC)', 'saida', NULL)
ON CONFLICT DO NOTHING;