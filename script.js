// Audio Context and related variables
let audioContext = null;
let masterGainNode = null;
let isAudioInitialized = false;

// Musical data
const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

// Chord definitions with intervals
const chordTypes = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'dom7': [0, 4, 7, 10],
    'min7b5': [0, 3, 6, 10],
    'dim7': [0, 3, 6, 9],
    'maj9': [0, 4, 7, 11, 14],
    'min9': [0, 3, 7, 10, 14],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'add9': [0, 4, 7, 14],
    'min(add9)': [0, 3, 7, 14],
    '6': [0, 4, 7, 9],
    'min6': [0, 3, 7, 9]
};

// Scale definitions
const scales = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'aeolian': [0, 2, 3, 5, 7, 8, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10]
};

// Chord progressions for each scale
const chordProgressions = {
    'major': [
        { degree: 1, type: 'major', label: 'I', category: 'tonic' },
        { degree: 2, type: 'minor', label: 'ii', category: 'subdominant' },
        { degree: 3, type: 'minor', label: 'iii', category: 'tonic' },
        { degree: 4, type: 'major', label: 'IV', category: 'subdominant' },
        { degree: 5, type: 'major', label: 'V', category: 'dominant' },
        { degree: 6, type: 'minor', label: 'vi', category: 'tonic' },
        { degree: 7, type: 'dim', label: 'vii°', category: 'dominant' },
        // Secondary dominants
        { degree: 2, type: 'dom7', label: 'V7/V', category: 'secondary' },
        { degree: 6, type: 'dom7', label: 'V7/ii', category: 'secondary' },
        { degree: 7, type: 'dom7', label: 'V7/iii', category: 'secondary' },
        { degree: 1, type: 'dom7', label: 'V7/IV', category: 'secondary' },
        { degree: 3, type: 'dom7', label: 'V7/vi', category: 'secondary' },
        // Modal interchange
        { degree: 4, type: 'minor', label: 'iv', category: 'modal' },
        { degree: 2, type: 'min7b5', label: 'ii°', category: 'modal' },
        { degree: 7, type: 'major', label: 'bVII', category: 'modal' },
        { degree: 3, type: 'major', label: 'bIII', category: 'modal' },
        // Tensions and colors
        { degree: 1, type: 'maj7', label: 'Imaj7', category: 'tension' },
        { degree: 4, type: 'maj7', label: 'IVmaj7', category: 'tension' },
        { degree: 5, type: 'dom7', label: 'V7', category: 'tension' },
        { degree: 1, type: 'add9', label: 'Iadd9', category: 'tension' },
        { degree: 1, type: 'sus4', label: 'Isus4', category: 'substitute' },
        { degree: 5, type: 'sus4', label: 'Vsus4', category: 'substitute' },
        { degree: 2, type: 'min9', label: 'ii9', category: 'tension' },
        { degree: 6, type: 'min7', label: 'vi7', category: 'tension' }
    ],
    'minor': [
        { degree: 1, type: 'minor', label: 'i', category: 'tonic' },
        { degree: 2, type: 'dim', label: 'ii°', category: 'subdominant' },
        { degree: 3, type: 'major', label: 'III', category: 'tonic' },
        { degree: 4, type: 'minor', label: 'iv', category: 'subdominant' },
        { degree: 5, type: 'minor', label: 'v', category: 'dominant' },
        { degree: 6, type: 'major', label: 'VI', category: 'subdominant' },
        { degree: 7, type: 'major', label: 'VII', category: 'dominant' },
        // Harmonic minor variations
        { degree: 5, type: 'major', label: 'V', category: 'dominant' },
        { degree: 5, type: 'dom7', label: 'V7', category: 'dominant' },
        { degree: 7, type: 'dim7', label: 'vii°7', category: 'dominant' },
        // Secondary dominants
        { degree: 1, type: 'dom7', label: 'V7/iv', category: 'secondary' },
        { degree: 2, type: 'dom7', label: 'V7/V', category: 'secondary' },
        // Tensions
        { degree: 1, type: 'min7', label: 'i7', category: 'tension' },
        { degree: 1, type: 'min(add9)', label: 'i(add9)', category: 'tension' },
        { degree: 4, type: 'min7', label: 'iv7', category: 'tension' },
        { degree: 6, type: 'maj7', label: 'VImaj7', category: 'tension' }
    ]
};

// State variables
let currentKey = 'C';
let currentScale = 'major';
let currentSoundType = 'piano';
let isRecording = false;
let recordedNotes = [];
let recordStartTime = 0;
let playbackTimeouts = [];
let isLooping = false;

// Initialize audio context on user interaction
function initializeAudio() {
    if (isAudioInitialized) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.3;
    masterGainNode.connect(audioContext.destination);
    
    isAudioInitialized = true;
    document.querySelector('.chord-hint').classList.add('hidden');
}

// Get frequency for a note with octave
function getFrequency(note, octave = 4) {
    const baseFreq = noteFrequencies[note];
    const octaveMultiplier = Math.pow(2, octave - 4);
    return baseFreq * octaveMultiplier;
}

// Create oscillator for a note
function createOscillator(frequency, soundType) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    switch(soundType) {
        case 'piano':
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
            break;
        case 'synth':
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            break;
        case 'organ':
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 3);
            break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(masterGainNode);
    
    return { oscillator, gainNode };
}

// Play a chord
function playChord(rootNote, chordType, chordName) {
    if (!isAudioInitialized) {
        initializeAudio();
        return;
    }
    
    const rootIndex = Object.keys(noteFrequencies).indexOf(rootNote);
    const intervals = chordTypes[chordType];
    const oscillators = [];
    
    intervals.forEach((interval, index) => {
        const noteIndex = (rootIndex + interval) % 12;
        const octaveAdjustment = Math.floor((rootIndex + interval) / 12);
        const note = Object.keys(noteFrequencies)[noteIndex];
        const frequency = getFrequency(note, 3 + octaveAdjustment + (index === 0 ? 0 : 1));
        
        const { oscillator, gainNode } = createOscillator(frequency, currentSoundType);
        oscillators.push({ oscillator, gainNode });
        oscillator.start();
    });
    
    // Stop oscillators after duration
    setTimeout(() => {
        oscillators.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        });
    }, 1500);
    
    // Record if recording
    if (isRecording) {
        recordedNotes.push({
            rootNote,
            chordType,
            chordName,
            timestamp: Date.now() - recordStartTime
        });
    }
    
    // Update display
    const currentChordEl = document.getElementById('currentChord');
    currentChordEl.textContent = chordName;
    currentChordEl.classList.add('show');
    setTimeout(() => currentChordEl.classList.remove('show'), 2000);
}

// Get chord for a scale degree
function getChordFromScale(degree) {
    const scale = scales[currentScale];
    const noteIndex = Object.keys(noteFrequencies).indexOf(currentKey);
    const scaleNoteIndex = (noteIndex + scale[degree - 1]) % 12;
    return Object.keys(noteFrequencies)[scaleNoteIndex];
}

// Create chord button
function createChordButton(chord) {
    const button = document.createElement('button');
    button.className = `chord-btn ${chord.category}`;
    
    const rootNote = getChordFromScale(chord.degree);
    const chordName = rootNote + chord.label.replace(/[ivIV]+/, '');
    
    button.innerHTML = `
        <div class="chord-name">${chordName}</div>
        <div class="chord-notes">${chord.label}</div>
    `;
    
    button.addEventListener('click', () => {
        button.classList.add('playing');
        playChord(rootNote, chord.type, chordName);
        setTimeout(() => button.classList.remove('playing'), 500);
    });
    
    return button;
}

// Update chord grid
function updateChordGrid() {
    const grid = document.getElementById('chordGrid');
    grid.innerHTML = '';
    
    const progression = chordProgressions[currentScale] || chordProgressions['major'];
    progression.forEach(chord => {
        const button = createChordButton(chord);
        grid.appendChild(button);
    });
}

// Recording functions
function startRecording() {
    recordedNotes = [];
    recordStartTime = Date.now();
    isRecording = true;
    document.getElementById('recordBtn').classList.add('active');
}

function stopRecording() {
    isRecording = false;
    document.getElementById('recordBtn').classList.remove('active');
}

function playRecording() {
    if (recordedNotes.length === 0) return;
    
    stopPlayback();
    
    recordedNotes.forEach(note => {
        const timeout = setTimeout(() => {
            playChord(note.rootNote, note.chordType, note.chordName);
        }, note.timestamp);
        playbackTimeouts.push(timeout);
    });
    
    if (isLooping && recordedNotes.length > 0) {
        const totalDuration = recordedNotes[recordedNotes.length - 1].timestamp + 2000;
        const loopTimeout = setTimeout(() => playRecording(), totalDuration);
        playbackTimeouts.push(loopTimeout);
    }
}

function stopPlayback() {
    playbackTimeouts.forEach(timeout => clearTimeout(timeout));
    playbackTimeouts = [];
}

// Save and load functions
function saveRecording() {
    if (recordedNotes.length === 0) {
        alert('録音データがありません');
        return;
    }
    
    const data = {
        key: currentKey,
        scale: currentScale,
        notes: recordedNotes
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chord-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadRecording() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                currentKey = data.key;
                currentScale = data.scale;
                recordedNotes = data.notes;
                
                document.getElementById('rootNote').value = currentKey;
                document.getElementById('scale').value = currentScale;
                updateDisplay();
                updateChordGrid();
                
                alert('録音データを読み込みました');
            } catch (err) {
                alert('ファイルの読み込みに失敗しました');
            }
        };
        reader.readAsText(file);
    });
    
    input.click();
}

// Update display
function updateDisplay() {
    document.getElementById('currentKey').textContent = `キー: ${currentKey}`;
    document.getElementById('currentScale').textContent = `スケール: ${currentScale.charAt(0).toUpperCase() + currentScale.slice(1)}`;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio on first interaction
    document.addEventListener('click', initializeAudio, { once: true });
    
    // Key and scale selectors
    document.getElementById('rootNote').addEventListener('change', (e) => {
        currentKey = e.target.value;
        updateDisplay();
        updateChordGrid();
    });
    
    document.getElementById('scale').addEventListener('change', (e) => {
        currentScale = e.target.value;
        updateDisplay();
        updateChordGrid();
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSoundType = btn.dataset.color;
        });
    });
    
    // Volume control
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volumeValue');
    volumeSlider.addEventListener('input', (e) => {
        const db = e.target.value;
        volumeValue.textContent = `${db}dB`;
        if (masterGainNode) {
            const linearGain = Math.pow(10, db / 20);
            masterGainNode.gain.value = linearGain;
        }
    });
    
    // Playback controls
    document.getElementById('recordBtn').addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    document.getElementById('playBtn').addEventListener('click', playRecording);
    
    document.getElementById('loopBtn').addEventListener('click', () => {
        isLooping = !isLooping;
        document.getElementById('loopBtn').classList.toggle('active', isLooping);
        if (!isLooping) {
            stopPlayback();
        }
    });
    
    document.getElementById('saveBtn').addEventListener('click', saveRecording);
    document.getElementById('readBtn').addEventListener('click', loadRecording);
    
    // Initialize display
    updateDisplay();
    updateChordGrid();
});