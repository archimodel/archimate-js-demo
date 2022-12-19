import 'bootstrap';
import * as bootstrap from 'bootstrap';

import 'archimate-js/assets/archimate-js.css';
import Modeler from 'archimate-js/lib/Modeler';

const tooltipTriggerList = document.querySelectorAll('[data-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

var dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'))
var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
  return new bootstrap.Dropdown(dropdownToggleEl)
})

// modeler instance
var modeler = new Modeler({
  container: '#canvas',
  keyboard: {
    bindTo: window,
  }
});

/* screen interaction */
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

const state = {
  fullScreen: false
};

document.getElementById('js-toggle-fullscreen').addEventListener('click', function() {
  state.fullScreen = !state.fullScreen;
  if (state.fullScreen) {
    enterFullscreen(document.documentElement);
  } else {
    exitFullscreen();
  }
});

document.getElementById('js-export-model-svg').addEventListener('click', function() {
  getSVGfromModel().then(function(result) {
    download('model.svg', result.svg);
  });
});

document.getElementById('js-export-model-xml').addEventListener('click', function() {
  getXMLfromModel()
    .then(function(result) {
      download('model.xml', result.xml);
  });
});

document.getElementById('js-import-model').addEventListener('click', function() {
  importModel();
});

document.getElementById('js-new-model').addEventListener('click', function() {
  newModel();
});


function importModel() {
  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _this => {
            let files =   Array.from(input.files);
            openFile(files[0]);
        };
  input.click();
}

var dropZone = document.getElementById('canvas');

// Prevent default behavior (Prevent file from being opened)
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
});

dropZone.addEventListener('drop', function(e) {
  e.stopPropagation();
  e.preventDefault();
  var files = e.dataTransfer.files; // Array of all files
  openFile(files[0]);
});

function newModel() {
  modeler.createNewModel().catch(function(err) {
    if (err) {
      return console.error('could not create new archimate model', err);
    }
  });
}

// Create new model to show on canvas !
newModel();

function openFile(file) {
  // check file api availability
  if (!window.FileReader) {
    return window.alert(
      'Looks like you use an older browser ' +
      'Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10.');
  }

  // no file chosen
  if (!file) {
    return window.alert('No file to proced !');
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var xml = e.target.result;
    openModel(xml);
  };
  reader.readAsText(file);
}

function openModel(xml) {
  // import model
  modeler.importXML(xml)
    .then(function(result) {
      if (result.warnings.length) {
        console.warn(result.warnings);
        window.alert('Warning(s) on importing archimate model. See console log.');
      }
      modeler.openView().catch(function(err) {
        if (err) {
          window.alert('Error(s) on opening archimate view. See console log.');
          return console.error('could not open archimate view', err);
        }
      });
    })
    .catch(function(err) {
      if (err) {
        window.alert('Error(s) on importing archimate model. See console log.');
        return console.error('could not import archimate model', err);
      }
   });
}

function getSVGfromModel() {
  return modeler.saveSVG();
}

function getXMLfromModel() {
  return modeler.saveXML({ format: true });
}

function download(filename, data) {
  var element = document.createElement('a');
  if (data) {
    var encodedData = encodeURIComponent(data);
    element.setAttribute('href', 'data:application/xml;charset=UTF-8,' + encodedData);
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
  } else {
    document.body.removeChild(element);
  }
}