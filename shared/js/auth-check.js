// Authentication check for all pages
(function() {
    // Pages that don't require authentication
    const publicPages = ['/login.html', '/login'];
    
    // Check if current page is public
    const currentPath = window.location.pathname;
    const isPublicPage = publicPages.some(page => currentPath.includes(page));
    
    // If not a public page, check authentication
    if (!isPublicPage) {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            // Redirect to login page
            window.location.href = '/login.html';
        }
    }
    
    // Add logout functionality to all pages
    window.logout = function() {
        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login.html';
    };
    
    // Add user info to header if exists
    document.addEventListener('DOMContentLoaded', function() {
        const userStr = localStorage.getItem('user');
        if (userStr && !isPublicPage) {
            try {
                const user = JSON.parse(userStr);
                
                // Find header actions element
                const headerActions = document.querySelector('.header-actions');
                if (headerActions) {
                    // Add user info and logout button
                    const userInfo = document.createElement('div');
                    userInfo.style.cssText = 'display: flex; align-items: center; gap: 16px; margin-right: 16px;';
                    userInfo.innerHTML = `
                        <span style="color: var(--text-secondary); font-size: 14px;">
                            <strong>${user.name}</strong> (${user.role})
                        </span>
                        <button onclick="logout()" class="btn btn-sm btn-danger" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">
                            <span class="material-icons">logout</span>
                            Logout
                        </button>
                    `;
                    
                    headerActions.insertBefore(userInfo, headerActions.firstChild);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    });
})();