document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskIp');
    const taskList = document.getElementById('taskList');
    const container = document.querySelector('.containert');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let activeTaskId = null;

    function updateBackgrounds(className) {
        document.body.className = className;
        container.className = 'containert ' + className;
    }

    function resetBackgrounds() {
        document.body.className = '';
        container.className = 'containert';
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function showAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.left = '50%';
        alertDiv.style.transform = 'translateX(-50%)';
        alertDiv.style.backgroundColor = '#28a745';
        alertDiv.style.color = 'white';
        alertDiv.style.padding = '15px 30px';
        alertDiv.style.borderRadius = '5px';
        alertDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        alertDiv.style.zIndex = '1000';
        alertDiv.style.fontSize = '18px';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }

    function startNextTask() {
        const pendingTasks = Array.from(document.querySelectorAll('.task-item')).filter(
            item => !item.classList.contains('timer-complete') && item.querySelector('.timer-input').value
        );
        
        if (pendingTasks.length > 0) {
            const nextTask = pendingTasks[0];
            const startButton = nextTask.querySelector('button.btn-primary');
            startButton.click();
        }
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskContent.appendChild(taskText);

        const timerControls = document.createElement('div');
        timerControls.className = 'timer-controls';

        const timerInput = document.createElement('input');
        timerInput.type = 'number';
        timerInput.className = 'form-control timer-input';
        timerInput.placeholder = 'Minutes';
        timerInput.min = '1';
        timerInput.style.display = 'none';

        const setTimerBtn = document.createElement('button');
        setTimerBtn.className = 'btn btn-info btn-sm';
        setTimerBtn.textContent = 'Set Timer';

        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer-display';
        timerDisplay.style.display = 'none';

        const startButton = document.createElement('button');
        startButton.className = 'btn btn-primary btn-sm';
        startButton.textContent = 'Start Timer';
        startButton.style.display = 'none';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Delete';

        timerControls.appendChild(setTimerBtn);
        timerControls.appendChild(timerInput);
        timerControls.appendChild(timerDisplay);
        timerControls.appendChild(startButton);

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        taskActions.appendChild(deleteButton);

        taskContent.appendChild(timerControls);
        li.appendChild(taskContent);
        li.appendChild(taskActions);

        let timerInterval;
        let timeLeft;

        setTimerBtn.addEventListener('click', () => {
            timerInput.style.display = 'inline-block';
            setTimerBtn.style.display = 'none';
        });

        timerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && timerInput.value > 0) {
                e.preventDefault();
                startButton.style.display = 'block';
                timerDisplay.style.display = 'block';
                startButton.click(); // Automatically start the timer when Enter is pressed
            }
        });

        timerInput.addEventListener('change', () => {
            if (timerInput.value > 0) {
                startButton.style.display = 'block';
                timerDisplay.style.display = 'block';
            } else {
                startButton.style.display = 'none';
                timerDisplay.style.display = 'none';
            }
        });

        startButton.addEventListener('click', () => {
            if (activeTaskId && activeTaskId !== task.id) {
                return; // Don't start if another task is active
            }

            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            activeTaskId = task.id;
            timeLeft = parseInt(timerInput.value) * 60;
            timerDisplay.textContent = formatTime(timeLeft);
            li.classList.add('timer-active');
            startButton.style.display = 'none';
            timerInput.style.display = 'none';
            setTimerBtn.style.display = 'none';

            // Change backgrounds when timer starts
            updateBackgrounds('timer-running');
            showAlert('⏳ Timer Started! Let\'s focus on this task! 💪');

            timerInterval = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = formatTime(timeLeft);

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    li.classList.remove('timer-active');
                    li.classList.add('timer-complete');
                    activeTaskId = null;
                    
                    // Change backgrounds when timer completes
                    updateBackgrounds('timer-completed');
                    showAlert('🎉 Time\'s Up! Great job completing the task! ⭐');
                    
                    // Start next task automatically
                    setTimeout(startNextTask, 1000);
                }
            }, 1000);
        });

        deleteButton.addEventListener('click', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            if (activeTaskId === task.id) {
                activeTaskId = null;
                resetBackgrounds();
                setTimeout(startNextTask, 1000);
            }
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            li.remove();
        });

        return li;
    }

    function addTask(text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };
        tasks.push(task);
        saveTasks();
        const li = createTaskElement(task);
        taskList.appendChild(li);

        // Change backgrounds when task is added
        updateBackgrounds('task-added');
        showAlert('✨ New task added! Let\'s get organized! 📝');
        
        // Reset backgrounds after 2 seconds
        setTimeout(() => {
            if (!activeTaskId) { // Only reset if no timer is running
                resetBackgrounds();
            }
        }, 2000);
    }

    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && taskInput.value.trim()) {
            e.preventDefault(); // Prevent default form submission
            addTask(taskInput.value.trim());
            taskInput.value = '';
        }
    });

    // Load existing tasks
    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
});