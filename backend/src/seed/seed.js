const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const SALT_ROUNDS = 10;

function seed() {
  console.log('Seeding database...');

  // Clear tables
  db.exec('DELETE FROM order_items');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM parts');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM users');

  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence");

  // Users
  const adminHash = bcrypt.hashSync('admin', SALT_ROUNDS);
  const userHash = bcrypt.hashSync('123456', SALT_ROUNDS);

  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, phone, cpf_cnpj) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('Admin', 'admin@autohub.com', adminHash, 'admin', '(62) 99999-0000', '000.000.000-00');
  insertUser.run('Maria Silva', 'maria@email.com', userHash, 'user', '(11) 98765-4321', '123.456.789-00');
  insertUser.run('João Santos', 'joao@email.com', userHash, 'user', '(11) 91234-5678', '987.654.321-00');
  insertUser.run('Ana Costa', 'ana@email.com', userHash, 'user', '(19) 99876-5432', '456.789.123-00');
  insertUser.run('Carlos Oliveira', 'carlos@email.com', userHash, 'user', '(21) 98765-1234', '321.654.987-00');

  // Categories
  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const categories = ['Motor', 'Freios', 'Suspensão', 'Elétrica', 'Rodas', 'Manutenção'];
  const catIds = {};
  for (const name of categories) {
    const result = insertCat.run(name);
    catIds[name] = result.lastInsertRowid;
  }

  // Parts
  const insertPart = db.prepare('INSERT INTO parts (name, price, category_id, description, image_url, specifications, compatible_cars) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const partsData = [
    { name: 'Disco de Freio', price: 189.90, cat: 'Freios', desc: 'Disco de freio ventilado de alta performance para frenagem segura e eficiente.', img: 'https://images.unsplash.com/photo-1760690502697-5ece9e17bd5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Diâmetro', value: '280 mm' }, { label: 'Espessura', value: '22 mm' }, { label: 'Tipo', value: 'Ventilado' }, { label: 'Material', value: 'Ferro fundido' }, { label: 'Posição', value: 'Dianteiro' }, { label: 'Garantia', value: '12 meses' }], cars: ['Volkswagen Gol (2008–2022)', 'Fiat Palio (2004–2017)', 'Chevrolet Celta (2000–2016)', 'Peugeot 206 (2000–2012)', 'Renault Clio (2003–2014)'] },
    { name: 'Filtro de Óleo', price: 45.90, cat: 'Motor', desc: 'Filtro de óleo de alta capacidade de filtragem, protege o motor de impurezas.', img: 'https://images.unsplash.com/photo-1764869427688-3e97480f4b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Rosca', value: 'M20×1.5' }, { label: 'Diâmetro', value: '76 mm' }, { label: 'Altura', value: '85 mm' }, { label: 'Pressão de abertura', value: '0.8–1.2 bar' }, { label: 'Filtração', value: '≥ 98%' }, { label: 'Garantia', value: '6 meses' }], cars: ['Toyota Corolla (2008–2020)', 'Honda Civic (2007–2021)', 'Volkswagen Golf (2009–2022)', 'Hyundai HB20 (2012–2022)', 'Ford Fiesta (2011–2019)'] },
    { name: 'Bateria 60Ah', price: 389.90, cat: 'Elétrica', desc: 'Bateria selada de alta durabilidade, livre de manutenção e resistente a vibrações.', img: 'https://images.unsplash.com/photo-1767990495521-95cceb571125?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Capacidade', value: '60 Ah' }, { label: 'Voltagem', value: '12 V' }, { label: 'CCA', value: '500 A' }, { label: 'Dimensões', value: '242×175×190 mm' }, { label: 'Tipo', value: 'Selada VRLA' }, { label: 'Garantia', value: '18 meses' }], cars: ['Universal — veículos com alternador 12 V', 'Fiat Uno / Palio / Siena', 'Volkswagen Gol / Fox / Polo', 'Chevrolet Onix / Prisma', 'Ford Ka / Fiesta / EcoSport'] },
    { name: 'Vela de Ignição', price: 29.90, cat: 'Motor', desc: 'Vela de ignição iridium de alto desempenho, maior durabilidade e economia de combustível.', img: 'https://images.unsplash.com/photo-1762264520754-2eb8f7798318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Material eletrodo', value: 'Iridium' }, { label: 'Gap', value: '0.8 mm' }, { label: 'Rosca', value: 'M14×1.25' }, { label: 'Comprimento', value: '19 mm' }, { label: 'Vida útil', value: '100.000 km' }, { label: 'Garantia', value: '12 meses' }], cars: ['Honda Fit (2009–2021)', 'Honda City (2009–2022)', 'Toyota Etios (2012–2022)', 'Chevrolet Onix (2012–2022)', 'Nissan March (2011–2020)'] },
    { name: 'Filtro de Ar', price: 59.90, cat: 'Motor', desc: 'Filtro de ar de alta eficiência, aumenta a potência e protege o motor.', img: 'https://images.unsplash.com/photo-1715504639415-795a80b49439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Tipo', value: 'Cônico lavável' }, { label: 'Diâmetro entrada', value: '76 mm' }, { label: 'Altura', value: '150 mm' }, { label: 'Material', value: 'Espuma dupla camada' }, { label: 'Fluxo de ar', value: '350 CFM' }, { label: 'Garantia', value: '12 meses' }], cars: ['Honda Civic (2007–2021)', 'Volkswagen Jetta (2011–2020)', 'Ford Focus (2009–2019)', 'Toyota Corolla (2008–2020)', 'Chevrolet Cruze (2012–2021)'] },
    { name: 'Farol LED', price: 299.90, cat: 'Elétrica', desc: 'Farol LED de alta luminosidade, design moderno com vida útil superior a 30.000 horas.', img: 'https://images.unsplash.com/photo-1618212624057-3ce6e5819cc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Potência', value: '35 W' }, { label: 'Fluxo luminoso', value: '3.200 lm' }, { label: 'Temperatura de cor', value: '6000 K' }, { label: 'Voltagem', value: '12 V' }, { label: 'Vida útil', value: '30.000 h' }, { label: 'Garantia', value: '12 meses' }], cars: ['Fiat Strada (2021–2023)', 'Chevrolet S10 (2012–2021)', 'Toyota Hilux (2016–2023)', 'Mitsubishi L200 (2015–2022)', 'Ford Ranger (2013–2022)'] },
    { name: 'Palheta Limpador', price: 39.90, cat: 'Manutenção', desc: 'Palheta de limpador de para-brisa silicosa, limpeza silenciosa e sem listras.', img: 'https://images.unsplash.com/photo-1761846787583-01c8637eb57b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Comprimento', value: '600 mm' }, { label: 'Material', value: 'Silicone' }, { label: 'Encaixe', value: 'Universal J-Hook' }, { label: 'Pressão de contato', value: 'Uniforme' }, { label: 'Vida útil', value: '2 anos' }, { label: 'Garantia', value: '6 meses' }], cars: ['Universal — encaixe J-Hook padrão', 'Volkswagen (maioria dos modelos)', 'Fiat (maioria dos modelos)', 'Chevrolet (maioria dos modelos)', 'Hyundai / Kia (maioria dos modelos)'] },
    { name: 'Roda Liga Leve', price: 599.90, cat: 'Rodas', desc: 'Roda de liga leve aro 17 cinco furos, design esportivo e alta resistência.', img: 'https://images.unsplash.com/photo-1769899107195-aae414826ced?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Aro', value: '17"' }, { label: 'Largura', value: '7"' }, { label: 'Furação', value: '5×114.3' }, { label: 'Offset (ET)', value: '45 mm' }, { label: 'Material', value: 'Alumínio 6061-T6' }, { label: 'Garantia', value: '24 meses' }], cars: ['Honda Civic (2007–2022)', 'Toyota Corolla (2008–2022)', 'Volkswagen Golf (2009–2022)', 'Hyundai Elantra (2012–2022)', 'Nissan Sentra (2014–2022)'] },
    { name: 'Amortecedor', price: 279.90, cat: 'Suspensão', desc: 'Amortecedor dianteiro pressurizado de alta performance para melhor dirigibilidade.', img: 'https://images.unsplash.com/photo-1760836395716-7dd00b71311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Tipo', value: 'Pressurizado a gás' }, { label: 'Posição', value: 'Dianteiro' }, { label: 'Comprimento estendido', value: '410 mm' }, { label: 'Comprimento comprimido', value: '240 mm' }, { label: 'Rosca', value: 'M12×1.5' }, { label: 'Garantia', value: '12 meses' }], cars: ['Volkswagen Fox (2004–2015)', 'Volkswagen Gol G5/G6 (2008–2016)', 'Volkswagen Polo (2003–2019)', 'Volkswagen SpaceFox (2006–2015)', 'Volkswagen CrossFox (2005–2015)'] },
    { name: 'Correia Dentada', price: 89.90, cat: 'Motor', desc: 'Correia dentada de alta resistência para sincronismo preciso do motor.', img: 'https://images.unsplash.com/photo-1767884162326-54d3e26d444a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', specs: [{ label: 'Número de dentes', value: '128' }, { label: 'Largura', value: '25 mm' }, { label: 'Passo', value: '8 mm (HTD)' }, { label: 'Material', value: 'Neoprene reforçado' }, { label: 'Troca recomendada', value: '60.000 km' }, { label: 'Garantia', value: '12 meses' }], cars: ['Fiat Uno (2010–2022)', 'Fiat Palio (2004–2017)', 'Fiat Siena (2004–2016)', 'Fiat Strada (2004–2018)', 'Fiat Doblò (2001–2018) — motor 1.4'] },
  ];

  const partIds = [];
  for (const p of partsData) {
    const result = insertPart.run(p.name, p.price, catIds[p.cat], p.desc, p.img, JSON.stringify(p.specs), JSON.stringify(p.cars));
    partIds.push(result.lastInsertRowid);
  }

  // Orders
  const insertOrder = db.prepare('INSERT INTO orders (user_id, status, address, payment_method, installments, subtotal, shipping, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO order_items (order_id, part_id, quantity, unit_price) VALUES (?, ?, ?, ?)');

  const ordersData = [
    { userId: 2, status: 'Entregue', address: 'Rua das Flores, 123 - São Paulo, SP', payment: 'credit', inst: 3, items: [{ partIdx: 0, qty: 2 }, { partIdx: 1, qty: 1 }] },
    { userId: 3, status: 'Enviado', address: 'Av. Paulista, 1000 - São Paulo, SP', payment: 'pix', inst: 1, items: [{ partIdx: 2, qty: 1 }, { partIdx: 3, qty: 4 }] },
    { userId: 4, status: 'Processando', address: 'Rua dos Pinheiros, 456 - Campinas, SP', payment: 'credit', inst: 6, items: [{ partIdx: 5, qty: 2 }, { partIdx: 6, qty: 2 }] },
    { userId: 5, status: 'Processando', address: 'Av. Brasil, 789 - Rio de Janeiro, RJ', payment: 'debit', inst: 1, items: [{ partIdx: 7, qty: 4 }] },
    { userId: 2, status: 'Processando', address: 'Rua das Flores, 123 - São Paulo, SP', payment: 'credit', inst: 10, items: [{ partIdx: 8, qty: 2 }, { partIdx: 4, qty: 1 }] },
    { userId: 3, status: 'Enviado', address: 'Av. Paulista, 1000 - São Paulo, SP', payment: 'pix', inst: 1, items: [{ partIdx: 9, qty: 1 }] },
    { userId: 4, status: 'Entregue', address: 'Rua dos Pinheiros, 456 - Campinas, SP', payment: 'credit', inst: 2, items: [{ partIdx: 1, qty: 2 }, { partIdx: 3, qty: 4 }] },
    { userId: 5, status: 'Enviado', address: 'Av. Brasil, 789 - Rio de Janeiro, RJ', payment: 'debit', inst: 1, items: [{ partIdx: 0, qty: 2 }, { partIdx: 8, qty: 2 }] },
  ];

  for (const o of ordersData) {
    let subtotal = 0;
    for (const item of o.items) {
      subtotal += partsData[item.partIdx].price * item.qty;
    }
    const shipping = subtotal >= 300 ? 0 : 19.90;
    const total = subtotal + shipping;

    const result = insertOrder.run(o.userId, o.status, o.address, o.payment, o.inst, subtotal, shipping, total);
    const orderId = result.lastInsertRowid;

    for (const item of o.items) {
      insertItem.run(orderId, partIds[item.partIdx], item.qty, partsData[item.partIdx].price);
    }
  }

  console.log('Seed completed successfully!');
  console.log(`- ${5} users (admin: admin@autohub.com / admin)`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${partsData.length} parts`);
  console.log(`- ${ordersData.length} orders`);
}

seed();
