-- Primeiro, vamos remover as categorias de despesa antigas (públicas) que não são mais relevantes
DELETE FROM categories WHERE user_id IS NULL AND type = 'saida' AND name IN ('Alimentação', 'Aluguel', 'Materiais', 'Transporte');

-- Manter apenas "Impostos" e "Outras despesas" das categorias antigas
-- E adicionar as novas categorias específicas para e-commerce e tráfego pago

-- Inserir as novas categorias de despesa
INSERT INTO categories (name, type, user_id) VALUES
-- Categorias específicas de tráfego pago
('Anúncios Online (Facebook/Instagram Ads)', 'saida', NULL),
('Google Ads', 'saida', NULL),
('TikTok Ads', 'saida', NULL),
('Tráfego Pago – Outros', 'saida', NULL),

-- Categorias operacionais para e-commerce
('Fornecedores / Produtos', 'saida', NULL),
('Embalagens / Frete', 'saida', NULL),
('Taxas e Impostos', 'saida', NULL),
('Ferramentas e Softwares', 'saida', NULL);

-- Atualizar a categoria "Impostos" para "Taxas e Impostos" se ainda existir
UPDATE categories SET name = 'Taxas e Impostos' WHERE name = 'Impostos' AND type = 'saida' AND user_id IS NULL;