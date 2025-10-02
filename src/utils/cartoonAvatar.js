// Generate cartoon avatar from photo using Canvas API
export function generateCartoonAvatar(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size (square)
          const size = 300;
          canvas.width = size;
          canvas.height = size;
          
          // Calculate crop for circular image
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size / 2) - (img.width / 2) * scale;
          const y = (size / 2) - (img.height / 2) * scale;
          
          // Draw circular clipped image
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Apply cartoon filters
          ctx.filter = 'contrast(1.3) saturate(1.6) brightness(1.15) blur(0.5px)';
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          ctx.restore();
          
          // Add border
          ctx.strokeStyle = '#00fff9';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
          ctx.stroke();
          
          // Convert to data URL
          const cartoonDataUrl = canvas.toDataURL('image/png');
          resolve(cartoonDataUrl);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }
  
  // Alternative: Generate stylized avatar with color effects
  export function generateStylizedAvatar(imageFile, style = 'neon') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const size = 300;
          canvas.width = size;
          canvas.height = size;
          
          // Circular clip
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Scale and center image
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size / 2) - (img.width / 2) * scale;
          const y = (size / 2) - (img.height / 2) * scale;
          
          // Apply style-specific filters
          if (style === 'neon') {
            ctx.filter = 'contrast(1.4) saturate(2) brightness(1.2) hue-rotate(10deg)';
          } else if (style === 'cartoon') {
            ctx.filter = 'contrast(1.3) saturate(1.6) brightness(1.1)';
          } else if (style === 'comic') {
            ctx.filter = 'contrast(1.5) saturate(1.8) brightness(1.05)';
          }
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          ctx.restore();
          
          // Gradient border
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, '#00fff9');
          gradient.addColorStop(0.5, '#ff00ff');
          gradient.addColorStop(1, '#00fff9');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
          ctx.stroke();
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }
  