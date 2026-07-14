// ==========================================================================
// 1. SISTEMA DE MODAIS (ABRIR E FECHAR)
// ==========================================================================
function openModal(id) {
    const modal = document.getElementById('m' + id);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(id) {
    const modal = document.getElementById('m' + id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fechar modal ao clicar fora da caixa principal
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ==========================================================================
// 2. SISTEMA DE CARRINHO GLOBAL PERSISTENTE
// ==========================================================================
let cart = JSON.parse(localStorage.getItem('nova_capital_cart')) || [];

// Captura todos os cliques nos botões de "Adicionar" na Grid de produtos
document.addEventListener('DOMContentLoaded', () => {
    // Insere oHTML do painel visual do carrinho no fim do body de qualquer página
    injectCartUI();
    updateCartUI();

    // Adiciona o evento de compra aos botões da Grid
    const buyButtons = document.querySelectorAll('.grid .card .add-to-cart-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita abrir o modal ao clicar no botão
            
            const card = e.target.closest('.card');
            const onclickAttr = card.getAttribute('onclick');
            const id = onclickAttr.replace(/\D/g, ''); // Identifica o ID do produto
            
            const name = card.querySelector('h3').innerText;
            const img = card.querySelector('img').src;
            
            // Pega o valor correto (ignora o preço riscado se houver)
            const priceElement = card.querySelector('.price-green');
            const priceText = priceElement.innerText.replace('R$', '').replace(',', '.').trim();
            const price = parseFloat(priceText);

            addToCart({ id, name, price, img });
        });
    });
});

// Adicionar produto ao carrinho
function addToCart(product) {
    // Para evitar colisões de IDs iguais em páginas diferentes (ex: ID 1 de carros e ID 1 de motos),
    // geramos uma chave única usando o nome do produto.
    const productKey = product.name; 
    const existing = cart.find(item => item.key === productKey);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            key: productKey,
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    openCartPanel();
}

// Remover item do carrinho
function removeFromCart(key) {
    cart = cart.filter(item => item.key !== key);
    saveCart();
    updateCartUI();
}

// Atualizar quantidade
function updateQuantity(key, amount) {
    const item = cart.find(item => item.key === key);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            removeFromCart(key);
            return;
        }
    }
    saveCart();
    updateCartUI();
}

// Salvar dados
function saveCart() {
    localStorage.setItem('nova_capital_cart', JSON.stringify(cart));
}

// ==========================================================================
// 3. INTERFACE VISUAL DO CARRINHO (INJETADA AUTOMATICAMENTE)
// ==========================================================================
function injectCartUI() {
    // CSS dinâmico apenas para o painel do carrinho
    const style = document.createElement('style');
    style.innerHTML = `
        .cart-float-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #ff5500;
            color: #fff;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(255, 85, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            z-index: 999;
            transition: transform 0.2s;
        }
        .cart-float-btn:hover { transform: scale(1.1); }
        .cart-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #00e676;
            color: #000;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 10px;
        }
        .cart-sidebar {
            position: fixed;
            top: 0;
            right: -380px;
            width: 360px;
            height: 100%;
            background: #141419;
            border-left: 1px solid #1f1f26;
            box-shadow: -5px 0 25px rgba(0,0,0,0.8);
            z-index: 1001;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        .cart-sidebar.open { right: 0; }
        .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1f1f26;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .cart-close-btn {
            background: none;
            border: none;
            color: #7c7c8a;
            font-size: 24px;
            cursor: pointer;
        }
        .cart-items {
            flex-grow: 1;
            overflow-y: auto;
            margin-bottom: 15px;
        }
        .cart-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #1f1f26;
        }
        .cart-item img {
            width: 45px;
            height: 45px;
            object-fit: contain;
            background: #0d0d0f;
            border-radius: 4px;
        }
        .cart-item-info { flex-grow: 1; }
        .cart-item-info h4 { font-size: 14px; margin-bottom: 4px; }
        .cart-item-info span { color: #00e676; font-weight: 700; font-size: 13px; }
        .cart-qty-control {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .cart-qty-btn {
            background: #1c1c24;
            border: 1px solid #1f1f26;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 700;
        }
        .cart-footer {
            border-top: 1px solid #1f1f26;
            padding-top: 15px;
        }
        .cart-total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .cart-checkout-btn {
            background: #00e676;
            color: #000;
            border: none;
            padding: 14px;
            width: 100%;
            border-radius: 6px;
            font-weight: 800;
            cursor: pointer;
            text-transform: uppercase;
            transition: background 0.2s;
        }
        .cart-checkout-btn:hover { background: #00b35c; }
    `;
    document.head.appendChild(style);

    // Estrutura do painel e botão flutuante
    const cartContainer = document.createElement('div');
    cartContainer.innerHTML = `
        <button class="cart-float-btn" onclick="openCartPanel()">
            🛒 <span class="cart-badge" id="cartBadge">0</span>
        </button>
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h3>Seu Carrinho</h3>
                <button class="cart-close-btn" onclick="closeCartPanel()">×</button>
            </div>
            <div class="cart-items" id="cartItemsList"></div>
            <div class="cart-footer">
                <div class="cart-total-row">
                    <span>Total:</span>
                    <span style="color: #00e676;" id="cartTotalValue">R$ 0,00</span>
                </div>
                <button class="cart-checkout-btn" onclick="checkoutCart()">Finalizar no Discord</button>
            </div>
        </div>
    `;
    document.body.appendChild(cartContainer);
}

function openCartPanel() {
    document.getElementById('cartSidebar').classList.add('open');
}

function closeCartPanel() {
    document.getElementById('cartSidebar').classList.remove('open');
}

function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const totalSpan = document.getElementById('cartTotalValue');
    
    list.innerHTML = '';
    
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.img}" onerror="this.src='https://placehold.co/50px/1a1a22/fff'">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="cart-qty-control">
                <button class="cart-qty-btn" onclick="updateQuantity('${item.key}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="cart-qty-btn" onclick="updateQuantity('${item.key}', 1)">+</button>
            </div>
        `;
        list.appendChild(itemEl);
    });

    badge.innerText = totalItems;
    totalSpan.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Abre o canal de vendas do seu discord passando a lista de produtos
function checkoutCart() {
    if (cart.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }
    
    let message = "Olá! Gostaria de comprar os seguintes itens da loja:\n\n";
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')})\n`;
    });
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    message += `\n*Valor Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    
    // Copia o pedido estruturado para a área de transferência para facilitar o ticket do cliente
    navigator.clipboard.writeText(message).then(() => {
        alert("O resumo do seu pedido foi copiado! Abra o seu ticket no Discord e cole a mensagem para agilizar o atendimento.");
        window.open('https://discord.com/channels/1463693154367701257/1525528584209567965', '_blank');
    }).catch(() => {
        window.open('https://discord.com/channels/1463693154367701257/1525528584209567965', '_blank');
    });
}
function openModal(i) {
  document.getElementById('m' + i).style.display = 'flex';
}

function closeModal(i) {
  document.getElementById('m' + i).style.display = 'none';
}

// Usando addEventListener para não sobrescrever outros eventos de clique
window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});