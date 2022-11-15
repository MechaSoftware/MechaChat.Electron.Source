const ipc = require('electron').ipcRenderer;

document.getElementById('control-bar-close').addEventListener('click', function() {
    ipc.send('windowClose');
});

document.getElementById('control-bar-max').addEventListener('click', function() {
	ipc.send('windowMax');
});

document.getElementById('control-bar-minus').addEventListener('click', function() {
	ipc.send('windowMin');
});

$(document).keydown(function (event) {
	if (event.keyCode == 123) { 
 		return false;
	}

	if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { 
		return false;
	}
});