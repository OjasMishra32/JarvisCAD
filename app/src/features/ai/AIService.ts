import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CADContext {
  selection: string[];
  mode: string;
  history: string[];
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-pro or similiar available model
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  async interpretCommand(command: string, context: CADContext) {
    // If no API key, use mock response for MVP
    if (!this.genAI.apiKey || this.genAI.apiKey === 'YOUR_API_KEY') {
        console.warn("AI Service using Mock Mode (No API Key)");
        return this.mockResponse(command);
    }

    const prompt = `
      You are an AI assistant for a CAD software called StarkCAD.
      The user wants to perform an action: "${command}".
      
      Current Context:
      - Selection: ${JSON.stringify(context.selection)}
      - Mode: ${context.mode}
      
      Return a JSON object describing the CAD operation. 
      Format: { "operation": "CREATE_SOLID", "parameters": { "type": "CUBE", ... }, "explanation": "..." }
      Do not include markdown blocks.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Error:", error);
      throw error;
    }
  }

  mockResponse(command: string) {
      const lower = command.toLowerCase();
      if (lower.includes('cube') || lower.includes('box')) {
          return {
              operation: 'CREATE_SOLID',
              parameters: { type: 'CUBE', size: 1, color: '#3b82f6' },
              explanation: "Creating a cube."
          };
      }
      if (lower.includes('sphere') || lower.includes('ball')) {
          return {
              operation: 'CREATE_SOLID',
              parameters: { type: 'SPHERE', radius: 0.5, color: '#a855f7' },
              explanation: "Creating a sphere."
          };
      }
      return { operation: 'UNKNOWN', explanation: "I didn't understand that." };
  }
}
