// --- Configuration ---
// IMPORTANT: Replace '/.netlify/functions/submit-inquiry' with your actual backend endpoint URL
const FORM_SUBMIT_URL = '/.netlify/functions/submit-inquiry'; // Example for Netlify Functions

// Define base prices per unit (e.g., per meter for linear, per m³ for slabs)
// These are PLACEHOLDERS - Update with Oscar's actual pricing structure
const TIMBER_PRICES = {
    puriri: {
        post_150: 85.00, // Price per meter
        beam_200x50: 65.00, // Price per meter
        slab_rough: 4500.00, // Price per cubic meter
        custom: 0, // Base for custom - requires manual quote
        unitLabel: { post_150: 'Length in meters', beam_200x50: 'Length in meters', slab_rough: 'Volume in m³', custom: 'N/A' }
    },
    redwood: {
        // Add Redwood prices and units
        '2x4': 12.50,
        '6x6_post': 70.00,
        slab_rough: 3800.00,
        custom: 0,
        unitLabel: { '2x4': 'Length in meters', '6x6_post': 'Length in meters', slab_rough: 'Volume in m³', custom: 'N/A' }
    },
    blackwood: {
        // Add Blackwood prices and units
        board_150x25: 35.00,
        slab_natural_edge: 5500.00,
        custom: 0,
        unitLabel: { board_150x25: 'Length in meters', slab_natural_edge: 'Volume in m³', custom: 'N/A' }
    },
    eucalyptus: {
        // Add Eucalyptus prices and units
        decking_90x19: 9.00,
        post_100x100: 45.00,
        custom: 0,
        unitLabel: { decking_90x19: 'Length in meters', post_100x100: 'Length in meters', custom: 'N/A' }
    },
    totara: {
        // Add Totara prices and units
        post_125: 60.00,
        slab_rough: 4200.00,
        custom: 0,
        unitLabel: { post_125: 'Length in meters', slab_rough: 'Volume in m³', custom: 'N/A' }
    }
    // Add other timber types...
};

function formatPrice(price) {
    if (isNaN(price) || price === null) {
        return '$ ---.--';
    }
    return `$${price.toFixed(2)}`;
}

function calculateEstimate(timberType, dimension, quantity) {
    if (!TIMBER_PRICES[timberType] || !TIMBER_PRICES[timberType][dimension]) {
        console.error(`Pricing not found for ${timberType} - ${dimension}`);
        return null;
    }

    const basePrice = TIMBER_PRICES[timberType][dimension];
    const numericQuantity = parseFloat(quantity);

    if (isNaN(numericQuantity) || numericQuantity <= 0 || basePrice === 0) {
        return 0; // Return 0 for invalid quantity or custom items needing quote
    }

    return basePrice * numericQuantity;
}

function updateEstimate(timberType) {
    const dimensionSelect = document.getElementById(`dimension-${timberType}`);
    const quantityInput = document.getElementById(`quantity-${timberType}`);
    const priceDisplay = document.getElementById(`estimated-price-${timberType}`);
    const unitLabel = document.getElementById(`unit-label-${timberType}`);
    const estimatedDetailsInput = document.getElementById(`estimated_details_${timberType}`); // Hidden input in form

    const selectedDimension = dimensionSelect.value;
    const quantity = quantityInput.value;

    // Update unit label based on selection
    if (TIMBER_PRICES[timberType] && TIMBER_PRICES[timberType].unitLabel && TIMBER_PRICES[timberType].unitLabel[selectedDimension]) {
        unitLabel.textContent = TIMBER_PRICES[timberType].unitLabel[selectedDimension];
    } else {
        unitLabel.textContent = 'Units'; // Default
    }

    const estimatedPrice = calculateEstimate(timberType, selectedDimension, quantity);

    priceDisplay.textContent = formatPrice(estimatedPrice);

    // Store details for the form
    if (estimatedPrice !== null && estimatedPrice > 0) {
        const dimensionText = dimensionSelect.options[dimensionSelect.selectedIndex].text;
        estimatedDetailsInput.value = `Timber: ${timberType}, Dimension: ${dimensionText}, Quantity: ${quantity}, Estimated Price: ${formatPrice(estimatedPrice)}`;
    } else if (selectedDimension === 'custom') {
         estimatedDetailsInput.value = `Timber: ${timberType}, Dimension: Custom, Quantity: ${quantity} (Needs Quote)`;
    }
     else {
        estimatedDetailsInput.value = `Timber: ${timberType}, Dimension: ${selectedDimension}, Quantity: ${quantity} (Needs Quote - Invalid Input?)`;
    }
}

function showInquiryForm(timberType) {
    const formContainer = document.getElementById(`inquiry-form-container-${timberType}`);
    const requestBtn = document.getElementById(`request-quote-btn-${timberType}`);
    const messageTextarea = document.getElementById(`message-${timberType}`);

    if (formContainer) {
        formContainer.style.display = 'block';
        requestBtn.style.display = 'none'; // Hide original button
        // Optionally prefill message based on calculation
        const estimatedDetailsInput = document.getElementById(`estimated_details_${timberType}`);
        // messageTextarea.value = `Inquiring about: ${estimatedDetailsInput.value}\n\nPlease provide a firm quote.\n\nMy project details: `;
        messageTextarea.focus(); // Focus message field
    }
}

function hideInquiryForm(timberType) {
    const formContainer = document.getElementById(`inquiry-form-container-${timberType}`);
    const requestBtn = document.getElementById(`request-quote-btn-${timberType}`);
     const formStatus = document.getElementById(`form-status-${timberType}`);

    if (formContainer) {
        formContainer.style.display = 'none';
        requestBtn.style.display = 'inline-block'; // Show original button again
        document.getElementById(`inquiry-form-${timberType}`).reset(); // Clear form fields
        formStatus.textContent = ''; // Clear status message
        formStatus.className = 'form-status'; // Reset status class
    }
}

async function handleFormSubmit(event, timberType) {
    event.preventDefault();
    const form = event.target;
    const formStatus = document.getElementById(`form-status-${timberType}`);
    const submitButton = form.querySelector('button[type="submit"]');

    // Basic Frontend Validation (more robust validation needed on backend)
    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const phone = form.elements['phone'].value.trim();

    if (!name || !email || !phone) {
        formStatus.textContent = 'Please fill in all required fields (Name, Email, Phone).';
        formStatus.className = 'form-status error';
        return;
    }

    // Validate email format (simple check)
    if (!/\S+@\S+\.\S+/.test(email)) {
         formStatus.textContent = 'Please enter a valid email address.';
         formStatus.className = 'form-status error';
         return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add calculated details stored in hidden input explicitly if needed, though FormData grabs it
    // data.estimated_details = document.getElementById(`estimated_details_${timberType}`).value;

    formStatus.textContent = 'Sending...';
    formStatus.className = 'form-status';
    submitButton.disabled = true;

    try {
        const response = await fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            formStatus.textContent = 'Thank you! Your inquiry has been sent to Oscar. He will be in touch soon.';
            formStatus.className = 'form-status success';
            form.reset();
             // Optional: Hide form after success after a delay
             setTimeout(() => hideInquiryForm(timberType), 5000);
        } else {
            const errorData = await response.json().catch(() => ({})); // Try to get error message
            console.error('Form submission error:', response.status, errorData);
            formStatus.textContent = `Sorry, there was an error sending your message (${response.status}). Please try again or contact Oscar directly via phone or email.`;
            formStatus.className = 'form-status error';
        }
    } catch (error) {
        console.error('Network or other error:', error);
        formStatus.textContent = 'Sorry, a network error occurred. Please check your connection and try again, or contact Oscar directly.';
        formStatus.className = 'form-status error';
    } finally {
        // Re-enable button only if form wasn't reset (i.e. on error)
        if (!formStatus.classList.contains('success')) {
             submitButton.disabled = false;
        }
    }
}


// --- Initialization ---
function initializeCalculator(timberType) {
    const dimensionSelect = document.getElementById(`dimension-${timberType}`);
    const quantityInput = document.getElementById(`quantity-${timberType}`);
    const requestBtn = document.getElementById(`request-quote-btn-${timberType}`);
    const cancelBtn = document.getElementById(`cancel-quote-btn-${timberType}`);
    const form = document.getElementById(`inquiry-form-${timberType}`);

    if (!dimensionSelect || !quantityInput || !requestBtn || !form || !cancelBtn) {
        // console.warn(`Calculator elements not found for ${timberType}. Skipping initialization.`);
        return; // Don't proceed if elements are missing
    }

    // Add event listeners for calculation
    dimensionSelect.addEventListener('change', () => updateEstimate(timberType));
    quantityInput.addEventListener('input', () => updateEstimate(timberType));

    // Add event listener for showing the form
    requestBtn.addEventListener('click', () => showInquiryForm(timberType));

    // Add event listener for cancelling/hiding the form
    cancelBtn.addEventListener('click', () => hideInquiryForm(timberType));

    // Add event listener for form submission
    form.addEventListener('submit', (event) => handleFormSubmit(event, timberType));

    // Initial calculation on load
    updateEstimate(timberType);
}

// Example: If you have multiple calculators on different pages loaded via JS
// Find all calculator sections and initialize them
// document.addEventListener('DOMContentLoaded', () => {
//     const calculatorSections = document.querySelectorAll('.calculator-section');
//     calculatorSections.forEach(section => {
//         const timberType = section.id.split('-')[1]; // Extract type from id like 'calculator-puriri'
//         if (timberType) {
//             initializeCalculator(timberType);
//         }
//     });
// });

// Note: The <script> tag in the HTML already calls initializeCalculator('puriri') etc.
// for the specific timber page, which is simpler if each page loads separately.