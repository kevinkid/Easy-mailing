var client;
var listening = false;
var recogitionClient;
var voiceAnimationInterval;
var editor;
var speechConfig = {
    // 30 days remaining: 22 / 11 / 2017
    subscriptionKeys: [
        '8c5950d7aa2343f2ab8f7c6c32d07cf0',
        'a08ec64946d74983ad3b88544372662c'
    ],
    language: 'en-Us'
};

// TODO: Show voice commands , for newlines , links etc ...
function startListening() {
    setText('Listening ...');
    recogitionClient.startMicAndContinuousRecognition();
    startIncomingVoiceAnimation();
}

function stopListening() {
    setText('Awaiting initialization ...');
    recogitionClient.endMicAndContinuousRecognition();
    $('.recorder').css('box-shadow', 'rgb(255, 68, 0) 0px 0px 10px 0px');
    stopIncomingVoiceAnimation();
}

function onRecognitionError(code, reqId) {
    setText('Sorry :( didn\'t get that, please repeat . ');
    console.error('Error '+code + ':'+ reqId);
}

/**
 * @desc average volume
 * @param {array} freq frequency data (0-9)
 */
function calcAverageVolume(freq) {
    var totalReq = 0;
    freq.forEach(fVal => totalReq = totalReq + fVal);
    return (totalReq / freq.length).toFixed(1);
}

function startIncomingVoiceAnimation() {
    incomingVoiceAnimation();
}

function stopIncomingVoiceAnimation() {
    clearInterval(voiceAnimationInterval);
}

function incomingVoiceAnimation() {
    voiceAnimationInterval = setInterval(function () {
        if (listening) {
            var freq = new Uint8Array(vad.analyser.frequencyBinCount);
            vad.analyser.getByteFrequencyData(freq);
            var averageVolume = calcAverageVolume(freq);
            var shaddowLevel = (averageVolume * 5 ) / 18;
            $('.recorder').css('box-shadow', 'rgb(255, 68, 0) 0px 0px 10px '+ shaddowLevel +'px');
        } else {
            clearInterval(voiceAnimationInterval);
        }
    })
}

function setText(text) {
    $('#speechText').text(text);
}

// Add transcription text
function setBody(text) {
    var newValues = [editor.getValue(), text];
    editor.setValue(newValues.join())
}

function onSpeechRecognitionResponse(text) {
    // TODO: Run the returned text to the spell api to increase accuracy .
    // TODO: Use accurary levels in settings make the user pay for that .
    console.log('speech response <'+text+'>')
    setText(`"${text}"`);
    setBody(text);
}

function onIncomingVoiceInput() {
    // TODO: Animate the shaddow of the microphone button, try to tweek the code to give the data to animate it .
    console.log('incoming voice detected !');
}

function networkActivityStarted() {
    console.log('network activity');
}

function networkActivityEnded() {
    console.log('network activity ended');
}

function voiceEnded() {
    setText('Listening ...');
    console.log('Voice ended ... transcribing')
}

function initSpeechRecognition(config) {
    var subscriptionKey = config.subscriptionKeys[0];
    recogitionClient = new BingSpeech.RecognitionClient(subscriptionKey, config.language);
    recogitionClient.onError = onRecognitionError;
    recogitionClient.onFinalResponseReceived = onSpeechRecognitionResponse;
    recogitionClient.onVoiceDetected = onIncomingVoiceInput;
    recogitionClient.onNetworkActivityStarted = networkActivityStarted;
    recogitionClient.onNetworkActivityEnded = networkActivityEnded;
    recogitionClient.onVoiceEnded = voiceEnded;
}

// Initialise editor
function initEditor() {
    require.config({ paths: { 'vs': 'min/vs' } });
    require(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.querySelector('.mailBody'), {
            value: `

Hey there,

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions
of Lorem Ipsum.

Thanks
            
            `,
            language: 'text',
            scrollbar: {
                useShadows: false,
                verticalHasArrows: true,
                horizontalHasArrows: true,
                vertical: 'hidden',
                horizontal: 'hidden',
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
                arrowSize: 0
            },
            fontSize: 15,
            fontFamily: '11pt "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Tahoma, sans-serif',
            lineNumbers: false,
            contextmenu: false,
            scrollBeyondLastLine: false,
            minimap: {
                enabled: false
            },
            renderLineHighlight: 'none',
            renderIndentGuides: false
        });
        // Hide search field
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F, (e) => { return })
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D, (e) => { return })
        self.editor = editor;
    })
}


onload = () => {
    initEditor();
    initSpeechRecognition(speechConfig);
    $('.recorder').on('click', function (eve) {
        // toggle listener 
        if (listening) {
            listening = false;
            stopListening();
        } else {
            listening = true;
            startListening();
        }
    })
}
