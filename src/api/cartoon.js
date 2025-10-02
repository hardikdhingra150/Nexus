// Using free cartoon API
export async function convertToCartoon(imageFile) {
    try {
      console.log('Converting selfie to cartoon...');
      
      // Convert to base64
      const base64 = await fileToBase64(imageFile);
      
      // Use free cartoon converter API (imagetocartoon.com style)
      const response = await fetch('https://api.deepai.org/api/toonify', {
        method: 'POST',
        headers: {
          'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K', // Free tier key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
        }),
      });
  
      const data = await response.json();
      console.log('Cartoon created:', data);
      return data.output_url;
    } catch (error) {
      console.error('Cartoon conversion error:', error);
      // Fallback: just use original image
      return URL.createObjectURL(imageFile);
    }
  }
  
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  