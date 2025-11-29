document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CORRECT_PASSWORD = 'Shubham@Jana@1234';  
    
    // --- DOM Elements ---
    const dateEl = document.getElementById('date');
    const addForm = document.getElementById('addForm');
    const itemName = document.getElementById('itemName');
    const itemQty = document.getElementById('itemQty');
    const itemPrice = document.getElementById('itemPrice');
    const billBody = document.getElementById('billBody');
    const totalAmount = document.getElementById('totalAmount');
    const clearBtn = document.getElementById('clearBtn');
    const printBtn = document.getElementById('printBtn');
    
    // Tab and Protected UI
    const quickAddMenu = document.getElementById('quickAddMenu');  
    const protectedContent = document.getElementById('protectedContent');
    const historyContainer = document.getElementById('billingHistory');
    const historyList = document.getElementById('historyList');
    const salesReportArea = document.getElementById('salesReportArea');
    
    const tabCurrent = document.getElementById('tabCurrent');
    const tabHistory = document.getElementById('tabHistory');
    const tabReport = document.getElementById('tabReport');
    
    // Password UI
    const passwordPrompt = document.getElementById('passwordPrompt');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
    const passwordErrorMsg = document.getElementById('passwordErrorMsg');

    const paymentSelect = document.getElementById('paymentSelect');
    const printPayment = document.getElementById('printPayment');
    const printContainer = document.getElementById('printContainer');  
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    const quickAddButtons = new Map();  

    // --- Local Storage Keys ---
    const STORAGE_KEY_CURRENT_BILL = 'currentBillState';
    const STORAGE_KEY_HISTORY = 'billingHistory';
    
    // Set initial date
    dateEl.textContent = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    // -----------------------------------------------------------------
    // Dark Mode Functionality
    // -----------------------------------------------------------------

    function toggleDarkMode() {
        const isDarkMode = body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        updateDarkModeButton(isDarkMode);
    }

    function updateDarkModeButton(isDarkMode) {
        if (isDarkMode) {
            darkModeToggle.textContent = '☀️ Light Mode';
        } else {
            darkModeToggle.textContent = '🌙 Dark Mode';
        }
    }

    const darkModeState = localStorage.getItem('darkMode');
    const initialDarkMode = darkModeState === 'enabled';
    if (initialDarkMode) {
        body.classList.add('dark-mode');
    }
    updateDarkModeButton(initialDarkMode);

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // -----------------------------------------------------------------
    // Tab Switching and Password Logic
    // -----------------------------------------------------------------

    let isHistoryAuthenticated = false;

    function showTab(tabName) {
        // Reset all tabs and content areas
        tabCurrent.classList.remove('active');
        tabHistory.classList.remove('active');
        tabReport.classList.remove('active');
        
        quickAddMenu.classList.add('hidden-area');
        protectedContent.classList.add('hidden-area');
        historyContainer.classList.add('hidden-area');  
        salesReportArea.classList.add('hidden-area');
        passwordPrompt.classList.add('hidden-area');  
        
        if (tabName === 'current') {
            tabCurrent.classList.add('active');
            quickAddMenu.classList.remove('hidden-area');
        } else if (tabName === 'history' || tabName === 'report') {
            
            if (tabName === 'history') {
                tabHistory.classList.add('active');
            } else {
                tabReport.classList.add('active');
            }
            
            protectedContent.classList.remove('hidden-area');

            if (isHistoryAuthenticated) {
                // If authenticated, show specific content
                if (tabName === 'history') {
                    historyContainer.classList.remove('hidden-area');
                    renderHistoryList();
                } else { // report
                    salesReportArea.classList.remove('hidden-area');
                    generateSalesReport();
                }
                passwordPrompt.classList.add('hidden-area');
            } else {
                // Authentication required
                passwordPrompt.classList.remove('hidden-area');
                passwordInput.value = '';  
                passwordErrorMsg.textContent = '';
                passwordInput.focus();
            }
        }
    }

    tabCurrent.addEventListener('click', () => showTab('current'));
    tabHistory.addEventListener('click', () => showTab('history'));
    tabReport.addEventListener('click', () => showTab('report'));

    // Password submission logic
    function handlePasswordSubmit(e) {
        e.preventDefault();
        const enteredPassword = passwordInput.value;

        if (enteredPassword === CORRECT_PASSWORD) {
            isHistoryAuthenticated = true;
            passwordPrompt.classList.add('hidden-area');
            passwordErrorMsg.textContent = '';
            
            // Re-render based on which protected tab is currently active
            if (tabHistory.classList.contains('active')) {
                historyContainer.classList.remove('hidden-area');
                renderHistoryList();  
            } else if (tabReport.classList.contains('active')) {
                salesReportArea.classList.remove('hidden-area');
                generateSalesReport();  
            }
        } else {
            passwordErrorMsg.textContent = 'Incorrect Password! Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handlePasswordSubmit(e);
        }
    });
    
    // Menu item definitions (English)
    const categorizedSuggestions = {
        'Biriyani': [
            { name: 'Chicken Biriyani Full', price: 110 },
            { name: 'Chicken Biriyani Half', price: 80 },
            { name: 'Paneer Biriyani Full', price: 110 },
            { name: 'Paneer Biriyani Half', price: 80 },
            { name: 'Potato Biriyani Full', price: 70 },
            { name: 'Potato Biriyani Half', price: 50 },
            { name: 'Veg Biriyani Full', price: 90 },
            { name: 'Veg Biriyani Half', price: 70 },
        ],
        'Chowmein & Noodles': [
            { name: 'Chicken Chowmein Full', price: 70 },
            { name: 'Chicken Chowmein Half', price: 50 },
            { name: 'Egg Chowmein Full', price: 50 },
            { name: 'Egg Chowmein Half', price: 30 },
            { name: 'Veg Chowmein Full', price: 50 },
            { name: 'Veg Chowmein Half', price: 30 },
        ],
        'Rolls & Momos': [
            { name: 'Chicken Roll', price: 60 },
            { name: 'Egg Roll', price: 30 },
            { name: 'Veg Roll', price: 30 },
            { name: 'Chicken Momos', price: 50 },
            { name: 'Chicken Momos Half', price: 30 },
        ],
        'Other Items': [
            { name: 'Chicken Pakora', price: 15 },
            { name: 'Veg Pakora', price: 10 },
            { name: 'Chicken Kasha Full', price: 40 },
            { name: 'Chicken Kasha Half', price: 25 },
            { name: 'Boiled Egg', price: 10 },
            { name: 'Omelette', price: 15 },
            { name: 'Egg Toast', price: 30 },
            { name: 'Egg Poach', price: 15 },
            { name: 'Cold Drink', price: 40 }
        ]
    };

    const allSuggestions = Object.values(categorizedSuggestions).flat();
    
    // Datalist setup for Item Name input
    const dataListId = 'items-list';
    const dl = document.createElement('datalist');
    dl.id = dataListId;
    allSuggestions.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.dataset.price = s.price;
        dl.appendChild(opt);
    });
    document.body.appendChild(dl);
    itemName.setAttribute('list', dataListId);

    // Create Quick-Add Buttons
    if (quickAddMenu) { 
        quickAddMenu.innerHTML = ''; 
        
        for (const category in categorizedSuggestions) {
            const header = document.createElement('h3');
            header.textContent = category;
            quickAddMenu.appendChild(header);

            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'menu-category-buttons';
            quickAddMenu.appendChild(buttonWrapper);

            categorizedSuggestions[category].forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn secondary quick-add-btn';
                
                // Use innerHTML for styling
                btn.innerHTML = `<span class="item-name-menu">${s.name}</span><span class="item-price-menu">${formatCurrency(s.price)}</span>`;
                
                quickAddButtons.set(s.name, btn); 
                
                btn.addEventListener('click', () => {
                    const row = createRow(s.name, 1, s.price);
                    billBody.appendChild(row);
                    updateTotal();
                    
                    // Add flashing class
                    row.classList.add('row-added-flash');
                    setTimeout(() => { 
                        row.classList.remove('row-added-flash'); 
                    }, 350);
                });
                buttonWrapper.appendChild(btn); 
            });
        }
    }

    // Update menu button highlights based on current bill
    function updateMenuHighlights() {
        const itemsInBill = new Set();
        billBody.querySelectorAll('tr').forEach(row => {
            const name = row.querySelector('.item-name').textContent;
            itemsInBill.add(name);
        });

        quickAddButtons.forEach((btn, name) => {
            if (itemsInBill.has(name)) {
                btn.classList.add('item-added');
            } else {
                btn.classList.remove('item-added');
            }
        });
    }
    
    // -----------------------------------------------------------------
    // Billing History and Reporting Functions
    // -----------------------------------------------------------------

    function getHistory() {
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        return raw ? JSON.parse(raw) : [];
    }

    function saveHistory(newBill) {
        const history = getHistory();
        // Avoid saving the same bill ID repeatedly
        if (history.length > 0 && history[0].billId === newBill.billId) return;

        history.unshift(newBill);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        
        // Only re-render if the history/report tab is active and authenticated
        if (isHistoryAuthenticated) {
            if (tabHistory.classList.contains('active')) renderHistoryList(); 
            else if (tabReport.classList.contains('active')) generateSalesReport();
        }
    }

    /**
     * Deletes a bill from the history based on its timestamp ID.
     * @param {number} timestamp - The unique timestamp ID of the bill to delete.
     */
    function deleteHistoricalBill(timestamp) {
        const billId = timestamp.toString().slice(-4);
        if (!confirm(`Are you sure you want to permanently delete Bill #${billId} from history? This action cannot be undone.`)) {
            return;
        }
        
        const history = getHistory();
        // Filter out the bill that matches the timestamp
        const updatedHistory = history.filter(bill => bill.timestamp !== timestamp);
        
        if (updatedHistory.length < history.length) {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
            alert(`Bill #${billId} successfully deleted.`);
        } else {
            alert('Error: Bill not found or could not be deleted.');
        }
        
        if (tabHistory.classList.contains('active')) renderHistoryList(); 
        if (tabReport.classList.contains('active')) generateSalesReport(); 
    }

    function renderHistoryList() {
        // Check if history container is currently visible/active before rendering
        if (historyContainer.classList.contains('hidden-area')) return;

        historyList.innerHTML = '';
        const history = getHistory();

        if (history.length === 0) {
            historyList.innerHTML = '<li style="justify-content:center; color: var(--secondary-color);">কোনো বিলিং ইতিহাস সংরক্ষণ করা হয়নি।</li>'; 
            return;
        }

        history.forEach((bill) => {
            const li = document.createElement('li');
            
            const date = new Date(bill.timestamp);
            // Format time and date for history list display (English/US)
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            
            li.innerHTML = `
                <div class="history-info">
                    <strong>বিল #${bill.billId}</strong>
                    <div class="history-time">${dateStr} at ${timeStr}</div>
                </div>
                <span class="history-total">${formatCurrency(bill.grandTotal)}</span>
                <div class="history-actions">
                    <button class="btn secondary small-btn load-bill">লোড করুন</button>
                    <button class="btn danger small-btn delete-bill">ডিলিট করুন</button>
                </div>
            `;
            
            li.querySelector('.load-bill').addEventListener('click', (e) => {
                e.stopPropagation(); 
                loadHistoricalBill(bill);
            });

            li.querySelector('.delete-bill').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoricalBill(bill.timestamp);
            });

            historyList.appendChild(li);
        });
    }
    
    function loadHistoricalBill(bill) {
        if (!confirm('ঐতিহাসিক বিলটি লোড করলে বর্তমান বিলটি প্রতিস্থাপিত হবে। আপনি কি চালিয়ে যেতে চান?')) {
            return;
        }
        
        billBody.innerHTML = '';
        
        if (Array.isArray(bill.items)) {
            bill.items.forEach(it => {
                const row = createRow(it.name, it.qty, it.price, it.id);
                billBody.appendChild(row);
            });
        }
        if (bill.payment && paymentSelect) paymentSelect.value = bill.payment;
        
        // Remove current saved state so the new one is clean
        localStorage.removeItem(STORAGE_KEY_CURRENT_BILL); 
        
        updateTotal(true); 
        
        showTab('current');

        alert(`ঐতিহাসিক বিল #${bill.billId} সফলভাবে লোড হয়েছে। আপনি এখন এটি সংশোধন বা প্রিন্ট করতে পারেন।`);
    }

    /**
     * Aggregates sales data from history and generates the report table.
     */
    function generateSalesReport() {
        // Check if report container is currently visible/active before rendering
        if (salesReportArea.classList.contains('hidden-area')) return;
        
        const history = getHistory();
        const salesSummary = {}; 
        let grandTotalRevenue = 0;

        history.forEach(bill => {
            if (Array.isArray(bill.items)) {
                bill.items.forEach(item => {
                    const name = item.name;
                    const qty = Number(item.qty) || 0;
                    const amount = Number(item.amount) || 0;

                    if (name && qty > 0 && amount >= 0) {
                        if (!salesSummary[name]) {
                            salesSummary[name] = { totalQty: 0, totalRevenue: 0 };
                        }
                        salesSummary[name].totalQty += qty;
                        salesSummary[name].totalRevenue += amount;
                        grandTotalRevenue += amount;
                    }
                });
            }
        });

        // Convert to array for sorting (by highest revenue)
        const sortedSales = Object.entries(salesSummary)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue); 

        let html = '';

        if (sortedSales.length === 0) {
            html = '<p style="text-align: center; color: var(--secondary-color); padding: 20px;">ইতিহাসে বিক্রির কোনো ডেটা পাওয়া যায়নি।</p>'; 
        } else {
            
            html = `
                <table class="sales-report-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">পণ্য (Item)</th>
                            <th class="col-qty-sold" style="width: 20%;">মোট বিক্রি (Total Sold)</th>
                            <th class="col-revenue" style="width: 30%;">মোট আয় (Total Revenue)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            sortedSales.forEach(item => {
                html += `
                    <tr>
                        <td>${escapeHtml(item.name)}</td>
                        <td class="col-qty-sold">${Math.round(item.totalQty)}</td>
                        <td class="col-revenue">${formatCurrency(item.totalRevenue)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>মোট বিক্রয় (গ্র্যান্ড টোটাল)</td>
                            <td></td>
                            <td class="col-revenue">${formatCurrency(grandTotalRevenue)}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
        }

        salesReportArea.innerHTML = html;
    }

    // -----------------------------------------------------------------
    // Bill/Storage Functions
    // -----------------------------------------------------------------

    function formatCurrency(num) {
        // Format currency in Indian Rupees
        return 'Rs. ' + Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    // Format timestamp for file names
    function formatTimestampForFilename(timestamp) {
        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d}_${h}-${min}-${s}`;
    }

    function saveToStorage(key = STORAGE_KEY_CURRENT_BILL) {
        const items = [];
        let subtotal = 0;
        billBody.querySelectorAll('tr[data-id]').forEach(tr => {
            const name = tr.querySelector('.item-name').textContent;
            const qty = Number(tr.querySelector('.qty').value) || 1;
            const price = Number(tr.querySelector('.prc').value) || 0;
            const amount = qty * price;
            items.push({ id: tr.dataset.id, name, qty, price, amount });
            subtotal += amount;
        });

        const timestamp = Date.now();
        const state = {
            items,
            payment: paymentSelect ? paymentSelect.value : 'UPI',
            billId: Math.floor(timestamp / 1000).toString().slice(-4), 
            grandTotal: subtotal,
            timestamp: timestamp
        };
        localStorage.setItem(key, JSON.stringify(state));
        return state; 
    }

    function loadFromStorage(key = STORAGE_KEY_CURRENT_BILL) {
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        
        billBody.innerHTML = '';
        
        try {
            const state = JSON.parse(raw);
            if (Array.isArray(state.items)) {
                state.items.forEach(it => {
                    const row = createRow(it.name, it.qty, it.price, it.id);
                    billBody.appendChild(row);
                });
            }
            if (state.payment && paymentSelect) paymentSelect.value = state.payment;
            
            updateTotal(false); 
            return true;
        } catch {
            return false;
        }
    }

    function updateTotal(shouldSave = true) {
        let subtotal = 0;
        const billItemsData = []; 
        
        billBody.querySelectorAll('tr').forEach(row => {
            const qty = Number(row.querySelector('.qty').value);
            const price = Number(row.querySelector('.prc').value);
            const amt = qty * price; 
            
            row.dataset.amount = amt.toFixed(2); 
            row.querySelector('.amt').textContent = formatCurrency(amt); 
            
            subtotal += amt;
            
            billItemsData.push({
                name: row.querySelector('.item-name').textContent,
                qty: qty,
                price: price,
                amount: amt
            });
        });
        
        const totalTextLabel = document.getElementById('totalTextLabel');
        const totalAmountEl = document.getElementById('totalAmount');

        if (subtotal === 0) {
            totalAmountEl.textContent = formatCurrency(0);
            if (totalTextLabel) totalTextLabel.textContent = ''; 
            printContainer.textContent = generateEmptyReceipt(); 
            if (shouldSave) localStorage.removeItem(STORAGE_KEY_CURRENT_BILL);
            updateMenuHighlights(); 
            return;
        }
        
        if (totalTextLabel) totalTextLabel.textContent = 'Total'; 
        const grand = subtotal; 

        totalAmountEl.textContent = formatCurrency(subtotal); 

        // Save current bill state (to get Bill ID/Timestamp)
        const currentBillState = saveToStorage(STORAGE_KEY_CURRENT_BILL); 
        
        // Generate Text Receipt
        printContainer.textContent = generateTextReceipt(
            billItemsData, 
            subtotal, 
            grand, 
            paymentSelect.value || 'UPI', 
            dateEl.textContent, 
            currentBillState.billId
        );

        updateMenuHighlights(); 
    }

    // --- Utility Functions ---
    
    function generateEmptyReceipt() {
        const lines = [
            '  *** Petuk Biriyani & Restaurant ***',
            '         Fresh • Fast • Friendly',
            '\n---------------------------------------',
            '\n           BILL IS EMPTY\n',
            '      Thank you for dining with us.'
        ];
        return lines.join('\n');
    }

    function generateTextReceipt(items, subtotal, grandTotal, paymentMethod, date, billId) {
        const SEP = '---------------------------------------';
        const lines = [];
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Restaurant Details (ENSURE MATCHES WEB PAGE)
        lines.push('  *** Petuk Biriyani & Restaurant ***');
        lines.push('         Fresh • Fast • Friendly');
        lines.push('     petukbiriyani2024@gmail.com');
        lines.push('  +91 9733579705 • +91 8617054124');
        lines.push('  Jalchak • Pingla • Paschim Medinipur');
        lines.push(SEP);
        
        lines.push(`Bill ID: #${billId}`);
        lines.push(`Date: ${date}`);
        lines.push(`Time: ${currentTime}`);
        lines.push(SEP);
        
        lines.push('Item                 Qty Unit Price  Amount');
        lines.push(SEP);

        let totalItems = 0;
        items.forEach(item => {
            const name = String(item.name).padEnd(21).slice(0, 21); 
            const qty = String(item.qty).padStart(3); 
            // Right align Unit Price with "Rs."
            const unitPrice = ('Rs.' + item.price.toFixed(2)).padStart(10); 
            // Right align Amount as a number
            const amount = item.amount.toFixed(2).padStart(8); 
            lines.push(`${name}${qty}${unitPrice} ${amount}`);
            totalItems += item.qty;
        });

        lines.push(SEP);

        const totalAmountNumeric = items.reduce((sum, item) => sum + item.amount, 0); 
        
        const subtotalText = `Total Items (${totalItems} Pcs)`.padEnd(28);
        lines.push(`${subtotalText}${totalAmountNumeric.toFixed(2).padStart(8)}`);
        
        lines.push('Discount (0%)'.padEnd(28) + (0).toFixed(2).padStart(8));
        lines.push(`Tax (0%)`.padEnd(28) + (0).toFixed(2).padStart(8)); 
        
        lines.push(SEP);
        
        const grandTotalText = 'GRAND TOTAL'.padEnd(28);
        lines.push(`${grandTotalText}${totalAmountNumeric.toFixed(2).padStart(8)}`);
        
        lines.push(SEP);

        lines.push(`Payment Method: ${paymentMethod}`);
        lines.push(`Cashier: Petuk Staff`);
        lines.push('\n      Thank you for dining with us.');

        return lines.join('\n');
    }

    function escapeHtml(s) {
        // Simple utility to prevent XSS
        return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
    }
    
    function createRow(name, qty, price, id = null) {
        const q = Number(qty) || 1;
        const p = Number(price) || 0;
        const amount = q * p;
        const tr = document.createElement('tr');
        tr.dataset.amount = amount.toFixed(2);
        tr.dataset.id = id || Date.now().toString(); 
        
        tr.innerHTML = `
            <td class="col-item item-name">${escapeHtml(name)}</td>
            <td class="col-qty" data-qty="${q}">
                <input class="qty" type="number" min="1" value="${q}" aria-label="Quantity of ${escapeHtml(name)}" />
            </td>
            <td class="col-price" data-price-unit="${formatCurrency(p)}">
                <input class="prc" type="number" min="0" step="0.01" value="${p.toFixed(2)}" aria-label="Price of ${escapeHtml(name)}" />
            </td>
            <td class="col-amt amt">${formatCurrency(amount)}</td>
            <td><button class="btn remove danger remove-btn" type="button" aria-label="Remove ${escapeHtml(name)}">X</button></td>
        `;

        const qtyInput = tr.querySelector('.qty');
        const prcInput = tr.querySelector('.prc');

        function recalc() {
            const qv = Math.max(1, Math.round(Number(qtyInput.value)) || 1); 
            const pv = Math.max(0, Number(prcInput.value) || 0);

            qtyInput.value = qv;
            prcInput.value = pv.toFixed(2);
            
            tr.querySelector('.col-qty').dataset.qty = qv;
            tr.querySelector('.col-price').dataset.priceUnit = formatCurrency(pv);
            
            updateTotal(); 
        }

        qtyInput.addEventListener('input', recalc);
        prcInput.addEventListener('input', recalc);

        qtyInput.addEventListener('keydown', (ev) => {
            // Quick change functionality for keyboard users
            if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); qtyInput.value = Number(qtyInput.value || 0) + 1; recalc(); }
            else if (ev.key === '-') { ev.preventDefault(); qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1); recalc(); }
        });

        tr.querySelector('.remove').addEventListener('click', () => {
            if (confirm(`Remove "${tr.querySelector('.item-name').textContent}" from the bill?`)) {
                tr.remove();
                updateTotal();
            }
        });

        return tr;
    }

    // --- Event Listeners ---

    // Item Add Form Submission
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const toTitleCase = (str) => String(str).toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const name = toTitleCase(itemName.value.trim());
        const qty = Math.max(1, Number(itemQty.value) || 1);
        const price = Math.max(0, Number(itemPrice.value) || 0);

        if (!name) { itemName.focus(); return; }

        const row = createRow(name, qty, price);
        billBody.appendChild(row);
        updateTotal();
        
        // Scroll to the bottom of the bill
        const billWrapper = document.querySelector('.bill-table-wrapper');
        if (billWrapper) billWrapper.scrollTop = billWrapper.scrollHeight;

        itemName.value = '';
        itemQty.value = '1';
        itemPrice.value = '';
        itemName.focus();
    });

    // Clear Button: Save to history and clear the bill
    clearBtn.addEventListener('click', () => {
        if (billBody.children.length === 0) {
            alert('The current bill is already empty.');
            return;
        }
        
        if (confirm('Save the current bill and clear it? This will move it to History.')) {
            const currentBillState = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRENT_BILL));
            if (currentBillState && currentBillState.items && currentBillState.items.length > 0) {
                saveHistory(currentBillState); 
            }

            billBody.innerHTML = '';
            localStorage.removeItem(STORAGE_KEY_CURRENT_BILL);
            updateTotal(); 
        }
    });

    // Download File Function
    function downloadReceiptFile(receiptText, timestamp) {
        const filenameTime = formatTimestampForFilename(timestamp);
        const filename = `Petuk_Bill_${filenameTime}.txt`;
        
        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Print Button: Finalize total, download file, save to history, and clear bill
    printBtn.addEventListener('click', () => {
        if (billBody.children.length === 0) {
            alert('Cannot print an empty bill.');
            return;
        }
        
        // 1. Finalize and save current bill state
        updateTotal(); 
        const currentBillState = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRENT_BILL));
        
        if (!currentBillState || currentBillState.items.length === 0) return;
        
        // 2. Download receipt file
        const receiptText = printContainer.textContent;
        downloadReceiptFile(receiptText, currentBillState.timestamp);

        // 3. Save the finalized bill to history
        saveHistory(currentBillState); 
        
        // 4. Trigger Print Dialog
        if (paymentSelect && printPayment) printPayment.textContent = 'Payment: ' + paymentSelect.value;
        window.print();
        
        // 5. Clear bill display and storage
        billBody.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY_CURRENT_BILL);
        updateTotal(); 
    });

    // Update payment method and re-calculate/save
    if (paymentSelect && printPayment) {
        paymentSelect.addEventListener('change', () => {
            printPayment.textContent = 'Payment: ' + paymentSelect.value;
            updateTotal(); 
        });
        printPayment.textContent = 'Payment: ' + (paymentSelect.value || 'UPI');
    }

    // --- Initialization ---
    loadFromStorage(STORAGE_KEY_CURRENT_BILL);
    updateTotal();
    renderHistoryList(); 
    showTab('current'); 
});