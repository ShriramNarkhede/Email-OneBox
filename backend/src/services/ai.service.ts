// import OpenAI from 'openai';
// import { config } from '../config';
// import { Email, EmailCategory } from '../types';

// export class AIService {
//   private openai: OpenAI;

//   constructor() {
//     // Use Groq API with OpenAI SDK
//     this.openai = new OpenAI({ 
//       apiKey: config.openai.apiKey,
//       baseURL: 'https://api.groq.com/openai/v1',
//     });
//   }

//   async categorizeEmail(email: Email): Promise<EmailCategory> {
//     const prompt = `Categorize the following email into one of these categories:
// - Interested (lead shows interest in product/service)
// - Meeting Booked (mentions scheduling/confirming a meeting)
// - Not Interested (polite rejection or no interest)
// - Spam (promotional, irrelevant, or unsolicited)
// - Out of Office (automated out-of-office reply)

// Email:
// Subject: ${email.subject}
// From: ${email.from}
// Body: ${email.body.substring(0, 500)}

// Respond with ONLY the category name.`;

//     try {
//       const response = await this.openai.chat.completions.create({
//         model: 'llama-3.3-70b-versatile', // ✅ UPDATED MODEL
//         messages: [{ role: 'user', content: prompt }],
//         temperature: 0.3,
//         max_tokens: 50,
//       });

//       const category = response.choices[0]?.message?.content?.trim() || '';
      
//       console.log(` AI Response: "${category}" for email: "${email.subject}"`);
      
//       switch (category.toLowerCase()) {
//         case 'interested':
//           return EmailCategory.INTERESTED;
//         case 'meeting booked':
//           return EmailCategory.MEETING_BOOKED;
//         case 'not interested':
//           return EmailCategory.NOT_INTERESTED;
//         case 'spam':
//           return EmailCategory.SPAM;
//         case 'out of office':
//           return EmailCategory.OUT_OF_OFFICE;
//         default:
//           return EmailCategory.UNCATEGORIZED;
//       }
//     } catch (error: any) {
//       console.error('AI categorization error:', error.message);
//       // Fallback to keyword-based categorization
//       return this.fallbackCategorize(email);
//     }
//   }

//   private fallbackCategorize(email: Email): EmailCategory {
//     console.log(` Using fallback categorization for: "${email.subject}"`);
    
//     const body = email.body.toLowerCase();
//     const subject = email.subject.toLowerCase();
//     const combined = body + ' ' + subject;
    
//     if (combined.includes('interested') || combined.includes('sounds good') || combined.includes('let\'s discuss')) {
//       return EmailCategory.INTERESTED;
//     }
//     if (combined.includes('meeting') || combined.includes('schedule') || combined.includes('calendar')) {
//       return EmailCategory.MEETING_BOOKED;
//     }
//     if (combined.includes('not interested') || combined.includes('no thank') || combined.includes('unsubscribe')) {
//       return EmailCategory.NOT_INTERESTED;
//     }
//     if (combined.includes('out of office') || combined.includes('vacation') || combined.includes('away from')) {
//       return EmailCategory.OUT_OF_OFFICE;
//     }
//     if (combined.includes('click here') || combined.includes('buy now') || combined.includes('limited offer')) {
//       return EmailCategory.SPAM;
//     }
    
//     return EmailCategory.UNCATEGORIZED;
//   }

//   async generateEmbedding(text: string): Promise<number[]> {
//     // Simple deterministic embedding based on text content
//     const vector = Array.from({ length: 1536 }, () => 0);
    
//     for (let i = 0; i < text.length; i++) {
//       const charCode = text.charCodeAt(i);
//       const index = i % 1536;
//       vector[index] = (vector[index] + charCode / 255) / 2;
//     }
    
//     // Normalize
//     const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
//     return vector.map(val => val / (magnitude || 1));
//   }

//   async generateReply(emailBody: string, context: string): Promise<string> {
//     console.log('Generating reply suggestion with AI...');
    
//     const prompt = `You are an AI assistant helping to draft email replies.

// Context about the product/service:
// ${context}

// Email received:
// ${emailBody}

// Generate a professional, friendly reply. If applicable, include the meeting booking link mentioned in the context.`;

//     try {
//       const response = await this.openai.chat.completions.create({
//         model: 'llama-3.3-70b-versatile', // UPDATED MODEL
//         messages: [{ role: 'user', content: prompt }],
//         temperature: 0.7,
//         max_tokens: 300,
//       });

//       return response.choices[0]?.message?.content?.trim() || '';
//     } catch (error: any) {
//       console.error('AI reply generation error:', error.message);
//       // Fallback to template-based reply
//       return this.fallbackReply(emailBody, context);
//     }
//   }

//   private fallbackReply(emailBody: string, context: string): string {
//     const bodyLower = emailBody.toLowerCase();
    
//     if (bodyLower.includes('interview') || bodyLower.includes('resume')) {
//       return `Thank you for considering my application!

// I'm very excited about this opportunity and would be happy to discuss how I can contribute to your team.

// ${context}

// Please feel free to book a convenient time: ${config.rag.meetingLink}

// Best regards`;
//     }
    
//     if (bodyLower.includes('meeting') || bodyLower.includes('schedule')) {
//       return `Thank you for reaching out!

// I'd be delighted to schedule a meeting to discuss this opportunity.

// You can book a time here: ${config.rag.meetingLink}

// Looking forward to our conversation!

// Best regards`;
//     }
    
//     return `Thank you for your email!

// ${context}

// I'm interested in learning more. Please schedule a time: ${config.rag.meetingLink}

// Best regards`;
//   }
// }












import OpenAI from 'openai';
import { config } from '../config';
import { Email, EmailCategory } from '../types';

export class AIService {
  private openai: OpenAI;
  private useAI: boolean = false; // Disable AI to avoid rate limits

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: config.openai.apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async categorizeEmail(email: Email): Promise<EmailCategory> {
    // Use keyword-based categorization (no API calls)
    return this.keywordCategorize(email);
  }

  private keywordCategorize(email: Email): EmailCategory {
    const body = email.body.toLowerCase();
    const subject = email.subject.toLowerCase();
    const combined = body + ' ' + subject;
    
    // Interested keywords
    if (
      combined.includes('interested') || 
      combined.includes('sounds good') || 
      combined.includes('let\'s discuss') || 
      combined.includes('would like to') ||
      combined.includes('want to know more') ||
      combined.includes('tell me more') ||
      combined.includes('looking forward') ||
      combined.includes('excited about') ||
      combined.includes('great opportunity') ||
      combined.includes('sounds interesting') ||
      combined.includes('resume') && combined.includes('shortlisted') ||
      combined.includes('congratulations') && combined.includes('selected')
    ) {
      console.log(`✅ Category: Interested - "${email.subject}"`);
      return EmailCategory.INTERESTED;
    }
    
    // Meeting Booked keywords
    if (
      combined.includes('meeting') || 
      combined.includes('schedule') || 
      combined.includes('calendar') || 
      combined.includes('appointment') ||
      combined.includes('interview scheduled') ||
      combined.includes('confirmed') ||
      combined.includes('booked') ||
      combined.includes('see you on') ||
      combined.includes('looking forward to meeting')
    ) {
      console.log(`✅ Category: Meeting Booked - "${email.subject}"`);
      return EmailCategory.MEETING_BOOKED;
    }
    
    // Not Interested keywords
    if (
      combined.includes('not interested') || 
      combined.includes('no thank') || 
      combined.includes('unsubscribe') ||
      combined.includes('remove me') ||
      combined.includes('not a good fit') ||
      combined.includes('pass on this') ||
      combined.includes('decline')
    ) {
      console.log(`✅ Category: Not Interested - "${email.subject}"`);
      return EmailCategory.NOT_INTERESTED;
    }
    
    // Out of Office keywords
    if (
      combined.includes('out of office') || 
      combined.includes('vacation') || 
      combined.includes('away from') ||
      combined.includes('automatic reply') ||
      combined.includes('will respond when') ||
      combined.includes('currently unavailable') ||
      combined.includes('on leave')
    ) {
      console.log(`✅ Category: Out of Office - "${email.subject}"`);
      return EmailCategory.OUT_OF_OFFICE;
    }
    
    // Spam keywords
    if (
      combined.includes('click here') || 
      combined.includes('buy now') || 
      combined.includes('limited offer') ||
      combined.includes('you won') ||
      combined.includes('free money') ||
      combined.includes('act now') ||
      combined.includes('special promotion') ||
      combined.includes('discount') ||
      combined.includes('% off') ||
      combined.includes('subscribe now') ||
      combined.includes('unsubscribe')
    ) {
      console.log(`✅ Category: Spam - "${email.subject}"`);
      return EmailCategory.SPAM;
    }
    
    console.log(`✅ Category: Uncategorized - "${email.subject}"`);
    return EmailCategory.UNCATEGORIZED;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Deterministic embedding based on text content
    const vector = Array.from({ length: 1536 }, () => 0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = i % 1536;
      vector[index] = (vector[index] + charCode / 255) / 2;
    }
    
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
  }

  async generateReply(emailBody: string, context: string): Promise<string> {
    console.log('💬 Generating reply suggestion...');
    
    const bodyLower = emailBody.toLowerCase();
    
    // Interview-related emails
    if (bodyLower.includes('interview') || bodyLower.includes('technical round') || bodyLower.includes('resume') || bodyLower.includes('shortlisted')) {
      return `Thank you for considering my application!

I'm very excited about this opportunity and would be happy to discuss how I can contribute to your team.

${context}

Please feel free to book a convenient time for the interview using this link: ${config.rag.meetingLink}

Looking forward to speaking with you!

Best regards`;
    }
    
    // Meeting/Schedule related
    if (bodyLower.includes('meeting') || bodyLower.includes('schedule') || bodyLower.includes('call') || bodyLower.includes('discuss')) {
      return `Thank you for reaching out!

I'd be delighted to schedule a meeting to discuss this opportunity in detail.

You can book a time that works best for you here: ${config.rag.meetingLink}

Looking forward to our conversation!

Best regards`;
    }
    
    // Interest/Follow-up
    if (bodyLower.includes('interested') || bodyLower.includes('opportunity') || bodyLower.includes('position')) {
      return `Thank you for your email!

${context}

I'm very interested in learning more about this opportunity. Please feel free to schedule a time to connect: ${config.rag.meetingLink}

Best regards`;
    }
    
    // Generic professional reply
    return `Thank you for your message.

${context}

I'm interested in discussing this further. You can schedule a convenient time here: ${config.rag.meetingLink}

Looking forward to connecting!

Best regards`;
  }
}