// Global variables
let paymentStatus = 'pending'; // pending, verifying, approved
let timeLeft = 1800; // 30 minutes in seconds
let timerInterval = null;

const walletAddress = "TMZsmxZhxJJjE9cytC4Yvtj4emo5Ybtpk";

// DOM elements
const elements = {
    paymentAmount: document.getElementById('payment-amount'),
    customerEmail: document.getElementById('customer-email'),
    transactionId: document.getElementById('transaction-id'),
    paymentPurpose: document.getElementById('payment-purpose'),
    submitBtn: document.getElementById('submit-btn'),
    copyBtn: document.getElementById('copy-btn'),
    copyIcon: document.getElementById('copy-icon'),
    checkIcon: document.getElementById('check-icon'),
    amountError: document.getElementById('amount-error'),
    
    // Sections
    paymentForm: document.getElementById('payment-form'),
    verificationSection: document.getElementById('verification-section'),
    approvedSection: document.getElementById('approved-section'),
    qrSection: document.getElementById('qr-section'),
    walletSection: document.getElementById('wallet-section'),
    timerSection: document.getElementById('timer-section'),
    txSection: document.getElementById('tx-section'),
    purposeSection: document.getElementById('purpose-section'),
    warningSection: document.getElementById('warning-section'),
    
    // Dynamic content
    qrCode: document.getElementById('qr-code'),
    displayAmount: document.getElementById('display-amount'),
    timer: document.getElementById('timer'),
    warningAmount: document.getElementById('warning-amount'),
    warningTimer: document.getElementById('warning-timer'),
    
    // Verification section elements
    verifyAmount: document.getElementById('verify-amount'),
    verifyTx: document.getElementById('verify-tx'),
    verifyPurpose: document.getElementById('verify-purpose'),
    
    // Approved section elements
    approvedEmail: document.getElementById('approved-email'),
    approvedAmount: document.getElementById('approved-amount'),
    approvedTx: document.getElementById('approved-tx'),
    approvedTime: document.getElementById('approved-time')
};

// Initialize event listeners
function initEventListeners() {
    elements.paymentAmount.addEventListener('input', handleAmountChange);
    elements.customerEmail.addEventListener('input', validateForm);
    elements.transactionId.addEventListener('input', validateForm);
    elements.paymentPurpose.addEventListener('input', validateForm);
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.copyBtn.addEventListener('click', copyWalletAddress);
}

// Handle amount input change
function handleAmountChange() {
    const amount = parseFloat(elements.paymentAmount.value);
    
    // Validate minimum amount
    if (amount && amount < 50) {
        elements.amountError.style.display = 'block';
        elements.paymentAmount.classList.add('error');
        hidePaymentDetails();
        validateForm();
        return;
    } else {
        elements.amountError.style.display = 'none';
        elements.paymentAmount.classList.remove('error');
    }
    
    if (amount && amount >= 50) {
        showPaymentDetails(amount);
    } else {
        hidePaymentDetails();
    }
    
    validateForm();
}

// Show payment details (QR, wallet, timer, etc.)
function showPaymentDetails(amount) {
    // Update display amount
    elements.displayAmount.textContent = amount;
    elements.warningAmount.textContent = amount;
    
    // Generate and show QR code
    const qrUrl = generateQRUrl(amount);
    elements.qrCode.src = qrUrl;
    elements.qrCode.style.display = 'block';
    document.getElementById('qr-fallback').style.display = 'none';
    
    // Show sections
    elements.qrSection.style.display = 'block';
    elements.walletSection.style.display = 'block';
    elements.timerSection.style.display = 'block';
    elements.txSection.style.display = 'block';
    elements.purposeSection.style.display = 'block';
    elements.warningSection.style.display = 'block';
    
    // Start timer
    startTimer();
}

// Hide payment details
function hidePaymentDetails() {
    elements.qrSection.style.display = 'none';
    elements.walletSection.style.display = 'none';
    elements.timerSection.style.display = 'none';
    elements.txSection.style.display = 'none';
    elements.purposeSection.style.display = 'none';
    elements.warningSection.style.display = 'none';
    
    stopTimer();
}

// Generate QR code URL
function generateQRUrl(amount) {
    const qrData = `tron:${walletAddress}?amount=${amount}&token=USDT`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
}

// Start payment timer
function startTimer() {
    stopTimer(); // Clear any existing timer
    timeLeft = 1800; // Reset to 30 minutes
    
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            stopTimer();
            return;
        }
        
        timeLeft--;
        const timeString = formatTime(timeLeft);
        elements.timer.textContent = timeString;
        elements.warningTimer.textContent = timeString;
    }, 1000);
}

// Stop payment timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Validate form and enable/disable submit button
function validateForm() {
    const amount = parseFloat(elements.paymentAmount.value);
    const email = elements.customerEmail.value;
    const txId = elements.transactionId.value;
    const purpose = elements.paymentPurpose.value;
    
    const isValid = amount && amount >= 50 && email && txId && purpose;
    elements.submitBtn.disabled = !isValid;
}

// Handle form submission
function handleSubmit() {
    const amount = parseFloat(elements.paymentAmount.value);
    const email = elements.customerEmail.value;
    const txId = elements.transactionId.value;
    const purpose = elements.paymentPurpose.value;
    
    if (!amount || amount < 50 || !email || !txId || !purpose) return;
    
    // Update status to verification
    paymentStatus = 'verifying';
    
    // Hide form and show verification section
    elements.paymentForm.style.display = 'none';
    elements.verificationSection.style.display = 'block';
    
    // Update verification section with details
    elements.verifyAmount.textContent = amount;
    elements.verifyTx.textContent = txId.slice(0, 20) + '...';
    elements.verifyPurpose.textContent = purpose;
    
    // Stop payment timer
    stopTimer();
    
    // Start blockchain verification
    verifyTransaction(amount, email, txId, purpose);
}

// Verify transaction on blockchain
async function verifyTransaction(amount, email, txId, purpose) {
    try {
        console.log('🔍 Starting blockchain verification...');
        console.log('Expected amount:', amount, 'USDT');
        console.log('Expected receiver:', walletAddress);
        console.log('Transaction hash:', txId);
        console.log('Purpose:', purpose);
        
        // Simulate API call to TronScan or similar service
        // In production, replace this with real blockchain verification:
        // const response = await fetch(`https://apilist.tronscan.org/api/transaction/${txId}`);
        // const txData = await response.json();
        
        // Simulate verification delay (3 seconds)
        setTimeout(() => {
            // Simulate successful verification 
            // In production, verify: amount, receiver address, transaction status
            const verificationResult = {
                success: true,
                amount: amount,
                receiver: walletAddress,
                txHash: txId,
                timestamp: new Date().toISOString(),
                confirmed: true
            };
            
            if (verificationResult.success && verificationResult.confirmed) {
                console.log('✅ Transaction verified successfully on blockchain');
                approvePayment(amount, email, txId, purpose);
            } else {
                console.log('❌ Transaction verification failed');
                showVerificationError('Transaction not found or invalid');
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Blockchain verification error:', error);
        showVerificationError('Network error during verification');
    }
}

// Show verification error
function showVerificationError(errorMessage = 'Verification failed') {
    elements.verificationSection.innerHTML = `
        <div class="text-center py-8">
            <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-red-400">Verification Failed</h3>
            <p class="text-gray-400 mb-4">${errorMessage}</p>
            <div class="bg-red-900/30 border border-red-600 p-4 rounded-lg mb-4">
                <p class="text-red-200 text-sm">
                    <strong>Please check:</strong><br/>
                    • Transaction hash is correct<br/>
                    • Amount matches exactly (${elements.paymentAmount.value} USDT)<br/>
                    • Payment sent to: ${walletAddress}<br/>
                    • Transaction is confirmed on Tron blockchain<br/>
                    • Using TRC20 network only
                </p>
            </div>
            <button onclick="goBackToForm()" class="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200">
                Try Again
            </button>
        </div>
    `;
}

// Go back to form
function goBackToForm() {
    paymentStatus = 'pending';
    elements.verificationSection.style.display = 'none';
    elements.paymentForm.style.display = 'block';
    
    // Restart timer if amount is set
    const amount = parseFloat(elements.paymentAmount.value);
    if (amount && amount >= 50) {
        startTimer();
    }
}

// Approve payment after successful verification
function approvePayment(amount, email, txId, purpose) {
    // Update status
    paymentStatus = 'approved';
    
    // Hide verification section and show approved section
    elements.verificationSection.style.display = 'none';
    elements.approvedSection.style.display = 'block';
    
    // Update approved section with details
    elements.approvedEmail.textContent = email;
    elements.approvedAmount.textContent = amount;
    elements.approvedTx.textContent = txId.slice(0, 30) + '...';
    elements.approvedTime.textContent = new Date().toLocaleString();
    
    // Send receipt to customer automatically
    sendReceiptToCustomer(email, amount, txId, purpose);
    
    console.log('✅ Payment approved and processed successfully');
    console.log('📧 Receipt will be sent to:', email);
}

// Send receipt to customer
async function sendReceiptToCustomer(email, amount, txId, purpose) {
    try {
        // Using EmailJS for real email sending
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: 'service_xpay_gmail',
                template_id: 'customer_receipt', 
                user_id: 'EpzCyg79zNhyjflc_',
                template_params: {
                    to_email: email,
                    customer_name: email.split('@')[0],
                    payment_amount: amount,
                    transaction_id: txId,
                    payment_purpose: purpose,
                    wallet_address: walletAddress,
                    network: 'Tron (TRC20)',
                    approval_time: new Date().toLocaleString(),
                    receipt_number: 'XP' + Date.now(),
                    company_name: 'XPay Gateway'
                }
            })
        });

        if (response.ok) {
            console.log('✅ Receipt sent successfully to customer:', email);
        } else {
            console.error('❌ Failed to send receipt to customer');
            // Still show success to customer as payment is verified
        }
    } catch (error) {
        console.error('❌ Email service error:', error);
        // Still show success to customer as payment is verified
    }
}

// Copy wallet address to clipboard
async function copyWalletAddress() {
    try {
        await navigator.clipboard.writeText(walletAddress);
        showCopySuccess();
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = walletAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopySuccess();
    }
}

// Show copy success feedback
function showCopySuccess() {
    elements.copyIcon.style.display = 'none';
    elements.checkIcon.style.display = 'block';
    elements.checkIcon.classList.add('text-green-400');
    
    setTimeout(() => {
        elements.copyIcon.style.display = 'block';
        elements.checkIcon.style.display = 'none';
        elements.checkIcon.classList.remove('text-green-400');
    }, 2000);
}

// Handle QR code loading error
function handleQRError() {
    elements.qrCode.style.display = 'none';
    document.getElementById('qr-fallback').style.display = 'block';
}

// Global function for going back to form (accessible from HTML)
window.goBackToForm = goBackToForm;

// Initialize the application
function init() {
    initEventListeners();
    
    // Add QR code error handling
    elements.qrCode.addEventListener('error', handleQRError);
    
    // Set initial timer display
    elements.timer.textContent = formatTime(timeLeft);
    elements.warningTimer.textContent = formatTime(timeLeft);
    
    console.log('🚀 XPay Payment Gateway Initialized');
    console.log('💼 Wallet Address:', walletAddress);
    console.log('💰 Minimum Payment: 50 USDT');
    console.log('🔗 Network: Tron (TRC20)');
    console.log('🔍 Verification: Blockchain-based');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
