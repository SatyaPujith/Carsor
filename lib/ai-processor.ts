import { analyzeVehicleIssue } from './gemini-ai';

export async function analyzeImageWithAI(imageFile: File, vehicleModel: string): Promise<{
  description: string;
  formattedIssue: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  possibleCauses: string[];
  urgencyLevel: string;
  estimatedCost: string;
}> {
  try {
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.readAsDataURL(imageFile);
    });

    const GEMINI_API_KEY = "AIzaSyBhenKndqe8PQXljU2d7rqguS316k2rID0";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
You are an expert automotive diagnostic AI for Tata Motors vehicles. Analyze this image of a vehicle issue and provide a comprehensive analysis.

Vehicle Model: ${vehicleModel}

Please analyze the image and provide a detailed response in the following JSON format:
{
  "description": "A detailed description of what you see in the image",
  "formattedIssue": "A clear, professional description of the issue based on the image",
  "category": "One of: Engine, Brakes, Electrical, AC/Heating, Suspension, Transmission, Body, Fuel System, Exhaust, Steering",
  "severity": "low, medium, or high based on what you observe",
  "suggestedActions": ["Array of 3-5 specific recommended actions based on the image"],
  "possibleCauses": ["Array of 3-4 most likely causes based on visual evidence"],
  "urgencyLevel": "Immediate, Within 1 week, Within 1 month, or Routine maintenance",
  "estimatedCost": "Rough cost estimate range in INR based on the observed issue"
}

Focus on:
- What you can visually identify in the image
- Safety implications of the observed issue
- Tata vehicle-specific considerations
- Practical repair recommendations

Respond only with valid JSON.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure proper format
    return {
      description: analysis.description || 'Image analysis completed',
      formattedIssue: analysis.formattedIssue || `${vehicleModel} - Issue identified from image`,
      category: analysis.category || 'General',
      severity: ['low', 'medium', 'high'].includes(analysis.severity) ? analysis.severity : 'medium',
      suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions : [
        'Schedule inspection with authorized Tata service center',
        'Document the issue with photos',
        'Check warranty coverage for this issue'
      ],
      possibleCauses: Array.isArray(analysis.possibleCauses) ? analysis.possibleCauses : [
        'Component wear and tear',
        'Maintenance requirement',
        'System malfunction'
      ],
      urgencyLevel: analysis.urgencyLevel || 'Within 1 week',
      estimatedCost: analysis.estimatedCost || 'Contact service center for estimate'
    };

  } catch (error) {
    console.error('Image analysis error:', error);
    
    // Fallback analysis
    return {
      description: 'Unable to analyze image automatically',
      formattedIssue: `${vehicleModel} - Issue reported with image`,
      category: 'General',
      severity: 'medium',
      suggestedActions: [
        'Schedule inspection with authorized Tata service center',
        'Show the image to a qualified technician',
        'Document any additional symptoms',
        'Check warranty coverage'
      ],
      possibleCauses: [
        'Visual inspection required',
        'Component issue',
        'Maintenance needed'
      ],
      urgencyLevel: 'Within 1 week',
      estimatedCost: 'Contact service center for estimate'
    };
  }
}

export async function processVoiceToText(audioBlob: Blob): Promise<string> {
  // Mock voice processing - in production, integrate with speech-to-text API
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTranscriptions = [
        "My car's engine is making a strange rattling noise when I start it in the morning",
        "The brake pedal feels spongy and the car takes longer to stop than usual",
        "AC is not cooling properly and making weird sounds",
        "Strange vibration in steering wheel at high speeds",
        "Engine light came on yesterday and the car feels sluggish"
      ];
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      resolve(randomText);
    }, 2000);
  });
}

export async function formatIssueWithAI(text: string, vehicleModel: string): Promise<{
  formattedIssue: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  possibleCauses: string[];
  urgencyLevel: string;
  estimatedCost: string;
}> {
  try {
    // Use Gemini AI for comprehensive issue analysis
    const analysis = await analyzeVehicleIssue(text, vehicleModel);
    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis
    const severity = text.toLowerCase().includes('brake') || 
                    text.toLowerCase().includes('steering') ||
                    text.toLowerCase().includes('engine') ? 'high' : 'medium';
    
    return {
      formattedIssue: `${vehicleModel} - ${text.charAt(0).toUpperCase() + text.slice(1)}`,
      category: 'General',
      severity,
      suggestedActions: [
        'Schedule inspection with authorized Tata service center',
        'Document any unusual sounds or behaviors',
        'Check warranty coverage for this issue',
        'Avoid heavy driving until resolved'
      ],
      possibleCauses: [
        'Component wear and tear',
        'Maintenance requirement',
        'System malfunction'
      ],
      urgencyLevel: severity === 'high' ? 'Immediate' : 'Within 1 week',
      estimatedCost: 'Contact service center for estimate'
    };
  }
}