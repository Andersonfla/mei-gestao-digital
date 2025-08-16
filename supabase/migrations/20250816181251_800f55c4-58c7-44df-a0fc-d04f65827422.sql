-- Remover categorias antigas que não são mais relevantes para e-commerce
DELETE FROM categories WHERE user_id IS NULL AND type = 'saida' AND name IN ('Alimentação', 'Aluguel', 'Materiais', 'Transporte');

-- Renomear "Impostos" para "Taxas e Impostos"
UPDATE categories SET name = 'Taxas e Impostos' WHERE name = 'Impostos' AND type = 'saida' AND user_id IS NULL;

-- Inserir as novas categorias de despesa específicas para e-commerce e tráfego pago
-- Usando ON CONFLICT para evitar duplicatas
INSERT INTO categories (name, type, user_id) VALUES
-- Categorias específicas de tráfego pago
('Anúncios Online (Facebook/Instagram Ads)', 'saida', NULL),
('Google Ads', 'saida', NULL),
('TikTok Ads', 'saida', NULL),
('Tráfego Pago – Outros', 'saida', NULL),
-- Categorias operacionais para e-commerce
('Fornecedores / Produtos', 'saida', NULL),
('Embalagens / Frete', 'saida', NULL),
('Ferramentas e Softwares', 'saida', NULL)
ON CONFLICT (name, type) DO NOTHING;