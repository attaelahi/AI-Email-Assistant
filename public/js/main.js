document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Search functionality
  const searchInput = document.querySelector('input[placeholder="Search emails..."]');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        alert('Search functionality would be implemented in a real application.');
      }
    });
  }

  // Settings button
  const settingsButton = document.querySelector('a[href="#"]');
  if (settingsButton) {
    settingsButton.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Settings page would be implemented in a real application.');
    });
  }

  // Add event listeners for buttons that would trigger actions in a real app
  const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-secondary');
  actionButtons.forEach(button => {
    if (!button.hasAttribute('data-bs-toggle')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        alert('This action would be implemented in a real application.');
      });
    }
  });
});