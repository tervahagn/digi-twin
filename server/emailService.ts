import { MailService } from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(apiKey);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateSurveyEmailHTML(email: string, responses: any[], questions: any[]): string {
  const groupedResponses: Record<string, any[]> = responses.reduce((acc: any, response: any) => {
    const question = questions.find(q => q.id === response.questionId);
    if (question) {
      const section = question.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({ question, response });
    }
    return acc;
  }, {});

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DigiTwin Survey Results</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        h1 { 
            color: #2563eb; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 10px; 
            text-align: center;
        }
        h2 { 
            color: #1e40af; 
            margin-top: 30px; 
            margin-bottom: 15px;
            background: #f0f7ff;
            padding: 10px;
            border-radius: 5px;
        }
        h3 { 
            color: #1e3a8a; 
            margin-top: 20px; 
            margin-bottom: 10px;
        }
        .meta { 
            background: #f8fafc; 
            padding: 20px; 
            border-left: 4px solid #2563eb; 
            margin-bottom: 30px; 
            border-radius: 5px;
        }
        .question { 
            border-left: 4px solid #93c5fd; 
            padding-left: 15px; 
            margin-bottom: 25px; 
            background: #fefefe;
            padding: 15px;
            border-radius: 5px;
        }
        .answer { 
            background: #f1f5f9; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 10px; 
        }
        .purpose { 
            font-style: italic; 
            color: #64748b; 
            font-size: 14px; 
            margin-bottom: 10px;
        }
        .word-count { 
            color: #059669; 
            font-weight: bold; 
            font-size: 12px; 
            margin-bottom: 8px;
        }
        .audio-indicator {
            color: #7c3aed;
            font-style: italic;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>🎯 DigiTwin Biographical Survey Results</h1>
    
    <div class="meta">
        <strong>📧 Email:</strong> ${email}<br>
        <strong>📅 Completed:</strong> ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}<br>
        <strong>📊 Total Questions Answered:</strong> ${responses.length} out of ${questions.length}
    </div>
`;

  Object.entries(groupedResponses).forEach(([section, items]) => {
    htmlContent += `<h2>📋 ${section}</h2>`;
    
    items.forEach(({ question, response }, index) => {
      htmlContent += `
      <div class="question">
          <h3>Q${index + 1}: ${question.question}</h3>
          <div class="purpose">
              <strong>Purpose:</strong> ${question.purpose}<br>
              <strong>Requirement:</strong> ${question.requirement}
          </div>
          <div class="answer">
      `;
      
      if (response.responseType === 'text') {
        htmlContent += `
              <div class="word-count">📝 ${response.wordCount} words</div>
              <p>${response.textAnswer.replace(/\n/g, '<br>')}</p>
        `;
      } else {
        htmlContent += `<p class="audio-indicator">🎤 Audio response recorded</p>`;
      }
      
      htmlContent += `
          </div>
      </div>
      `;
    });
  });

  htmlContent += `
    <div class="footer">
        <p><strong>DigiTwin Biographical Survey</strong></p>
        <p>Your comprehensive life story captured for digital preservation</p>
        <p style="font-size: 12px; margin-top: 15px;">
            This survey contains ${responses.length} responses across ${Object.keys(groupedResponses).length} life categories.
        </p>
    </div>
</body>
</html>`;

  return htmlContent;
}

export function generateSurveyEmailText(email: string, responses: any[], questions: any[]): string {
  const groupedResponses: Record<string, any[]> = responses.reduce((acc: any, response: any) => {
    const question = questions.find(q => q.id === response.questionId);
    if (question) {
      const section = question.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({ question, response });
    }
    return acc;
  }, {});

  let textContent = `DigiTwin Biographical Survey Results\n\n`;
  textContent += `Email: ${email}\n`;
  textContent += `Completed: ${new Date().toLocaleDateString()}\n`;
  textContent += `Total Questions Answered: ${responses.length} out of ${questions.length}\n\n`;
  textContent += `${'='.repeat(50)}\n\n`;

  Object.entries(groupedResponses).forEach(([section, items]) => {
    textContent += `${section.toUpperCase()}\n`;
    textContent += `${'-'.repeat(section.length)}\n\n`;
    
    items.forEach(({ question, response }, index) => {
      textContent += `Q${index + 1}: ${question.question}\n`;
      textContent += `Purpose: ${question.purpose}\n`;
      textContent += `Requirement: ${question.requirement}\n\n`;
      
      if (response.responseType === 'text') {
        textContent += `Answer (${response.wordCount} words):\n${response.textAnswer}\n\n`;
      } else {
        textContent += `Answer: Audio response recorded\n\n`;
      }
      
      textContent += `${'-'.repeat(40)}\n\n`;
    });
  });

  return textContent;
}