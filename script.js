// Global variables
let paymentStatus = 'pending'; // pending, submitted, approved
let timeLeft = 1800; // 30 minutes in seconds
let waitTimeLeft = 1800;
let timerInterval = null;
let waitTimerInterval = null;

const walletAddress = "TMZsmxZhxJJjE9cytC4Yvtj4emo5Ybtpk";

// DOM elements
const elements = {
    paymentAmount: document.getElementById('payment-amount'),
    customerEmail: document.getElementById('customer-email'),
    transactionId: document.getElementById('transaction-id'),
    submitBtn: document.getElementById('submit-btn'),
    copyBtn: document.getElementById('copy-btn'),
    copyIcon: document.getElementById('copy-icon'),
    checkIcon: document.getElementById('check-icon'),
    
    // Sections
    paymentForm: document.getElementById('payment-form'),
    submittedSection: document.getElementById('submitted-section'),
    approvedSection: document.getElementById('approved-section'),
    qrSection: document.getElementById('qr-section'),
    walletSection: document.getElementById('wallet-section'),
    timerSection: document.getElementById('timer-section'),
    txSection: document.getElementById('tx-section'),
    warningSection: document.getElementById('warning-section'),
    
    // Dynamic content
    qrCode: document.getElementById('qr-code'),
    displayAmount: document.getElementById('display-amount'),
    timer: document.getElementById('timer'),
    waitTimer: document.getElementById('wait-timer'),
    warningAmount: document.getElementById('warning-amount'),
    warningTimer: document.getElementById('warning-timer'),
    
    // Submitted section elements
    submittedAmount: document.getElementById('submitted-amount'),
    submittedEmail: document.getElementById('submitted-email'),
    submittedTx: document.getElementById('submitted-tx'),
    submittedTime: document.getElementById('submitted-time'),
    
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
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.copyBtn.addEventListener('click', copyWalletAddress);
}

// Handle amount input change
function handleAmountChange() {
    const amount = elements.paymentAmount.value;
    
    if (amount && amount > 0) {
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

// Start wait timer (after submission)
function startWaitTimer() {
    stopWaitTimer(); // Clear any existing timer
    waitTimeLeft = 1800; // Reset to 30 minutes
    
    waitTimerInterval = setInterval(() => {
        if (waitTimeLeft <= 0) {
            stopWaitTimer();
            return;
        }
        
        waitTimeLeft--;
        elements.waitTimer.textContent = formatTime(waitTimeLeft);
    }, 1000);
}

// Stop wait timer
function stopWaitTimer() {
    if (waitTimerInterval) {
        clearInterval(waitTimerInterval);
        waitTimerInterval = null;
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
    const amount = elements.paymentAmount.value;
    const email = elements.customerEmail.value;
    const txId = elements.transactionId.value;
    
    const isValid = amount && amount > 0 && email && txId;
    elements.submitBtn.disabled = !isValid;
}

// Handle form submission
function handleSubmit() {
    const amount = elements.paymentAmount.value;
    const email = elements.customerEmail.value;
    const txId = elements.transactionId.value;
    
    if (!amount || !email || !txId) return;
    
    // Update status
    paymentStatus = 'submitted';
    
    // Hide form and show submitted section
    elements.paymentForm.style.display = 'none';
    elements.submittedSection.style.display = 'block';
    
    // Update submitted section with details
    elements.submittedAmount.textContent = amount;
    elements.submittedEmail.textContent = email;
    elements.submittedTx.textContent = txId.slice(0, 20) + '...';
    elements.submittedTime.textContent = new Date().toLocaleTimeString();
    
    // Start wait timer
    startWaitTimer();
    
    // Stop payment timer
    stopTimer();
    
    // Send confirmation to admin (console log for demo)
    sendConfirmationToAdmin(amount, email, txId);
    
    // Simulate admin approval after 10 seconds (remove this in production)
    setTimeout(() => {
        simulateApproval(amount, email, txId);
    }, 10000);
}

// Send confirmation email to admin
function sendConfirmationToAdmin(amount, email, txId) {
    console.log('📧 Confirmation email sent to: itspixelgamingclub@gmail.com');
    console.log('Email Content: Please confirm payment - Reply "Y" to approve');
    console.log('Payment Details:', {
        amount: amount + ' USDT',
        customerEmail: email,
        transactionId: txId,
        walletAddress: walletAddress,
        submissionTime: new Date().toLocaleString(),
        network: 'Tron (TRC20)'
    });
}

// Simulate admin approval (remove this in production)
function simulateApproval(amount, email, txId) {
    if (paymentStatus !== 'submitted') return;
    
    // Update status
    paymentStatus = 'approved';
    
    // Hide submitted section and show approved section
    elements.submittedSection.style.display = 'none';
    elements.approvedSection.style.display = 'block';
    
    // Update approved section with details
    elements.approvedEmail.textContent = email;
    elements.approvedAmount.textContent = amount;
    elements.approvedTx.textContent = txId.slice(0, 30) + '...';
    elements.approvedTime.textContent = new Date().toLocaleString();
    
    // Stop wait timer
    stopWaitTimer();
    
    // Send receipt to customer (console log for demo)
    sendReceiptToCustomer(email, amount, txId);
}

// Send receipt to customer
function sendReceiptToCustomer(email, amount, txId) {
    console.log('📧 Receipt sent to customer:', email);
    console.log('Receipt Details:', {
        amount: amount + ' USDT',
        transactionId: txId,
        approvedTime: new Date().toLocaleString(),
        network: 'Tron (TRC20)'
    });
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

// Initialize the application
function init() {
    initEventListeners();
    
    // Add QR code error handling
    elements.qrCode.addEventListener('error', handleQRError);
    
    // Set initial timer display
    elements.timer.textContent = formatTime(timeLeft);
    elements.waitTimer.textContent = formatTime(waitTimeLeft);
    elements.warningTimer.textContent = formatTime(timeLeft);
    
    console.log('XPay Payment System Initialized');
    console.log('Wallet Address:', walletAddress);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);