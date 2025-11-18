-- Adicionar novas categorias premium de receita
INSERT INTO public.categories (name, type, user_id) VALUES 
('Vendas de Produtos Digitais (Cursos, E-books)', 'entrada', NULL),
('Comissões e Afiliados', 'entrada', NULL),
('Rendimentos Financeiros (Investimentos)', 'entrada', NULL),
('Reembolsos e Estornos', 'entrada', NULL),
('Receita de Publicidade/Patrocínio', 'entrada', NULL),
('Doações/Apoios (Crowdfunding)', 'entrada', NULL)
ON CONFLICT DO NOTHING;