const API_KEY = import.meta.env.VITE_ELEVENLABS_KEY;

// Clone voice from audio file (requires paid plan)
export async function cloneVoice(audioFile, voiceName = 'MyVoice') {
  try {
    console.log('ElevenLabs: Cloning voice...');
    console.log('Voice name:', voiceName);
    
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('files', audioFile);
    formData.append('description', 'Cloned voice for Digital Doppelgänger');

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Clone Error:', errorText);
      throw new Error(`Voice cloning failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Voice cloned successfully:', data);
    return data.voice_id;
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw error;
  }
}

// Convert text to speech
export async function textToSpeech(text, voiceId) {
  try {
    console.log('ElevenLabs: Converting text to speech...');
    console.log('Voice ID:', voiceId);
    console.log('Text:', text.substring(0, 100));

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS Error:', errorText);
      throw new Error(`TTS failed: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('✅ Audio generated successfully');
    return audioUrl;
  } catch (error) {
    console.error('Text to speech error:', error);
    throw error;
  }
}

// List available voices
export async function listVoices() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('List voices error:', error);
    throw error;
  }
}

// Delete a cloned voice
export async function deleteVoice(voiceId) {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete voice');
    }

    console.log('Voice deleted successfully');
    return true;
  } catch (error) {
    console.error('Delete voice error:', error);
    throw error;
  }
}
