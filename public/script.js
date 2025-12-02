document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages-container');
    const modelSelect = document.getElementById('model-select');
    const currentModelName = document.getElementById('current-model-name');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Add Logout Button
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'new-chat-btn';
    logoutBtn.style.marginTop = '1rem';
    logoutBtn.style.background = 'rgba(239, 68, 68, 0.2)';
    logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    logoutBtn.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    });
    sidebar.appendChild(logoutBtn);

    let currentModel = modelSelect.value;
    let currentSessionId = null; // Track current conversation session

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    // Update model info
    modelSelect.addEventListener('change', (e) => {
        currentModel = e.target.value;
        currentModelName.textContent = e.target.options[e.target.selectedIndex].text.split('(')[0].trim();
    });

    // Send message
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';

        // Remove welcome message if exists
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) welcomeMsg.remove();

        // Add user message
        appendMessage('user', message);

        // Disable input while waiting
        userInput.disabled = true;
        sendBtn.disabled = true;

        // Add loading indicator
        const loadingId = appendLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message,
                    model: currentModel,
                    sessionId: currentSessionId
                })
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();

            // Update current session ID
            if (data.sessionId) {
                currentSessionId = data.sessionId;
            }

            // Remove loading
            document.getElementById(loadingId).remove();

            if (data.error) {
                appendMessage('bot', 'Error: ' + data.error);
            } else {
                appendMessage('bot', data.response);
                loadHistory(); // Refresh history
            }

        } catch (error) {
            document.getElementById(loadingId).remove();
            appendMessage('bot', 'Sorry, something went wrong. Please try again.');
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function appendMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Simple markdown parsing (bold, code blocks)
        let formattedContent = content
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 0.5rem;">')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        contentDiv.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendLoading() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.id = id;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return id;
    }

    async function loadHistory() {
    });

// Initial load
loadHistory();
});
