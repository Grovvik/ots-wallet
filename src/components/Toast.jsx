export default function showToast(message, success = true) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
  
    const toast = document.createElement('div');
    toast.className = `toast ${success ? 'success' : 'error'}`;
    
    const icon = success 
      ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
      : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-text">${message}</div>
    `;
  
    container.appendChild(toast);
  
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
  }