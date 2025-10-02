// AHRP Report System - NUI JavaScript
$(document).ready(function() {
    let currentPlayerData = {};
    let reportCategories = {};
    
    // Initialize NUI communication
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        switch(data.type) {
            case 'openReportMenu':
                openReportMenu(data.data);
                break;
            case 'closeReportMenu':
                closeReportMenu();
                break;
            default:
                break;
        }
    });
    
    // Open report menu
    function openReportMenu(data) {
        currentPlayerData = data.playerData || {};
        reportCategories = data.categories || {};
        
        // Update player information display
        updatePlayerInfo();
        
        // Show the menu
        $('#app').removeClass('hidden');
        $('body').addClass('menu-open');
        
        // Reset form
        resetForm();
        
        // Focus on first input
        setTimeout(() => {
            $('#reportType').focus();
        }, 100);
    }
    
    // Close report menu
    function closeReportMenu() {
        $('#app').addClass('hidden');
        $('body').removeClass('menu-open');
        hideMessage();
        hideLoading();
        resetForm();
        
        // Notify FiveM client
        $.post('https://ahrp-reports/closeMenu', {});
    }
    
    // Update player information display
    function updatePlayerInfo() {
        $('#playerServerId').text(currentPlayerData.serverId || '-');
        
        if (currentPlayerData.coords) {
            const coords = currentPlayerData.coords;
            $('#playerLocation').text(`${coords.x}, ${coords.y}, ${coords.z}`);
        } else {
            $('#playerLocation').text('-');
        }
        
        $('#playerVehicle').text(currentPlayerData.vehicle || 'On foot');
    }
    
    // Reset form to initial state
    function resetForm() {
        $('#reportForm')[0].reset();
        $('#category').empty().append('<option value="">Select category...</option>');
        $('#subcategory').empty().append('<option value="">Select subcategory...</option>');
        $('#priority').val('medium');
        
        // Hide conditional groups
        $('#app').removeClass('show-subcategory show-target-player');
        
        // Reset character counter
        updateCharacterCounter();
    }
    
    // Handle report type change
    $('#reportType').on('change', function() {
        const reportType = $(this).val();
        updateCategories(reportType);
        
        // Show/hide target player field for player reports
        if (reportType === 'player_report') {
            $('#app').addClass('show-target-player');
        } else {
            $('#app').removeClass('show-target-player');
        }
    });
    
    // Update categories based on report type
    function updateCategories(reportType) {
        const categorySelect = $('#category');
        categorySelect.empty().append('<option value="">Select category...</option>');
        
        if (reportCategories[reportType]) {
            Object.keys(reportCategories[reportType]).forEach(category => {
                categorySelect.append(`<option value="${category}">${category.replace(/_/g, ' ').toUpperCase()}</option>`);
            });
        }
        
        // Reset subcategory
        $('#subcategory').empty().append('<option value="">Select subcategory...</option>');
        $('#app').removeClass('show-subcategory');
    }
    
    // Handle category change
    $('#category').on('change', function() {
        const reportType = $('#reportType').val();
        const category = $(this).val();
        updateSubcategories(reportType, category);
    });
    
    // Update subcategories based on category
    function updateSubcategories(reportType, category) {
        const subcategorySelect = $('#subcategory');
        subcategorySelect.empty().append('<option value="">Select subcategory...</option>');
        
        if (reportCategories[reportType] && reportCategories[reportType][category]) {
            const subcategories = reportCategories[reportType][category];
            if (Array.isArray(subcategories) && subcategories.length > 0) {
                subcategories.forEach(subcategory => {
                    subcategorySelect.append(`<option value="${subcategory}">${subcategory.replace(/_/g, ' ').toUpperCase()}</option>`);
                });
                $('#app').addClass('show-subcategory');
            } else {
                $('#app').removeClass('show-subcategory');
            }
        }
    }
    
    // Character counter for description
    $('#description').on('input', function() {
        updateCharacterCounter();
    });
    
    function updateCharacterCounter() {
        const text = $('#description').val();
        const count = text.length;
        const maxLength = 1000;
        
        $('#charCount').text(count);
        
        if (count > maxLength) {
            $('#charCount').addClass('text-danger');
            $('#description').val(text.substring(0, maxLength));
            $('#charCount').text(maxLength);
        } else {
            $('#charCount').removeClass('text-danger');
        }
        
        // Update counter color based on length
        if (count > maxLength * 0.9) {
            $('#charCount').css('color', '#ff6b6b');
        } else if (count > maxLength * 0.7) {
            $('#charCount').css('color', '#ffc107');
        } else {
            $('#charCount').css('color', '#999');
        }
    }
    
    // Form submission
    $('#reportForm').on('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitReport();
        }
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Required fields
        const requiredFields = {
            'reportType': 'Report Type',
            'category': 'Category',
            'description': 'Description'
        };
        
        Object.keys(requiredFields).forEach(fieldId => {
            const field = $(`#${fieldId}`);
            const value = field.val().trim();
            
            if (!value) {
                isValid = false;
                errors.push(`${requiredFields[fieldId]} is required`);
                field.addClass('error');
            } else {
                field.removeClass('error');
            }
        });
        
        // Description length validation
        const description = $('#description').val().trim();
        if (description && description.length < 10) {
            isValid = false;
            errors.push('Description must be at least 10 characters long');
            $('#description').addClass('error');
        }
        
        // Target player ID validation for player reports
        if ($('#reportType').val() === 'player_report') {
            const targetPlayerId = $('#targetPlayer').val().trim();
            if (targetPlayerId && (isNaN(targetPlayerId) || parseInt(targetPlayerId) <= 0)) {
                isValid = false;
                errors.push('Target Player ID must be a valid positive number');
                $('#targetPlayer').addClass('error');
            }
        }
        
        if (!isValid) {
            showMessage(errors.join('. '), 'error');
        }
        
        return isValid;
    }
    
    // Submit report
    function submitReport() {
        showLoading();
        
        const formData = {
            type: $('#reportType').val(),
            category: $('#category').val(),
            subcategory: $('#subcategory').val() || null,
            priority: $('#priority').val(),
            description: $('#description').val().trim(),
            targetPlayerId: $('#targetPlayer').val().trim() || null,
            anonymous: $('#anonymous').is(':checked')
        };
        
        // Send to FiveM client
        $.post('https://ahrp-reports/submitReport', formData)
            .done(function(response) {
                hideLoading();
                
                if (response.success) {
                    showMessage('Report submitted successfully! You will receive updates on its progress.', 'success');
                    setTimeout(() => {
                        closeReportMenu();
                    }, 2000);
                } else {
                    showMessage(response.message || 'Failed to submit report. Please try again.', 'error');
                }
            })
            .fail(function() {
                hideLoading();
                showMessage('Failed to submit report. Please try again.', 'error');
            });
    }
    
    // Show message
    function showMessage(text, type = 'info') {
        const messageContainer = $('#messageContainer');
        const messageContent = $('#messageContent');
        const messageIcon = $('#messageIcon');
        const messageText = $('#messageText');
        
        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') {
            iconClass = 'fas fa-check-circle';
        } else if (type === 'error') {
            iconClass = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            iconClass = 'fas fa-exclamation-triangle';
        }
        
        messageIcon.removeClass().addClass(iconClass);
        messageText.text(text);
        messageContent.removeClass('success error warning').addClass(type);
        messageContainer.removeClass('hidden');
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                hideMessage();
            }, 5000);
        }
    }
    
    // Hide message
    function hideMessage() {
        $('#messageContainer').addClass('hidden');
    }
    
    // Show loading
    function showLoading() {
        $('#loadingOverlay').removeClass('hidden');
    }
    
    // Hide loading
    function hideLoading() {
        $('#loadingOverlay').addClass('hidden');
    }
    
    // Close button handlers
    $('#closeBtn, #cancelBtn').on('click', function() {
        closeReportMenu();
    });
    
    // ESC key handler
    $(document).on('keydown', function(e) {
        if (e.keyCode === 27 && !$('#app').hasClass('hidden')) {
            closeReportMenu();
        }
    });
    
    // Click outside to close
    $('#app').on('click', function(e) {
        if (e.target === this) {
            closeReportMenu();
        }
    });
    
    // Prevent form submission on enter in input fields (except textarea)
    $('#reportForm input, #reportForm select').on('keydown', function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            
            // Move to next field
            const fields = $('#reportForm input:visible, #reportForm select:visible, #reportForm textarea:visible');
            const currentIndex = fields.index(this);
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < fields.length) {
                fields.eq(nextIndex).focus();
            } else {
                // Focus submit button
                $('#submitBtn').focus();
            }
        }
    });
    
    // Remove error class on input
    $('#reportForm input, #reportForm select, #reportForm textarea').on('input change', function() {
        $(this).removeClass('error');
    });
    
    // Initialize tooltips (if needed)
    $('[data-toggle="tooltip"]').tooltip();
    
    // Auto-resize textarea
    $('#description').on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// Utility functions
function formatPlayerName(name) {
    return name ? name.replace(/[^\w\s]/gi, '') : 'Unknown';
}

function formatCoordinates(coords) {
    if (!coords) return 'Unknown';
    return `${Math.round(coords.x)}, ${Math.round(coords.y)}, ${Math.round(coords.z)}`;
}

function formatDateTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPlayerName,
        formatCoordinates,
        formatDateTime
    };
}