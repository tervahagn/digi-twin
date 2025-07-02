
import jsPDF from 'jspdf';

interface Question {
  id: string;
  section: string;
  question: string;
  purpose: string;
  requirement: string;
  minWords?: number;
  minAudioMinutes?: number;
}

interface Answer {
  questionId: string;
  responseType: 'text' | 'audio';
  textAnswer?: string;
  audioBlob?: Blob;
  wordCount?: number;
}

export const generateSurveyPDF = (questions: Question[], answers: Answer[], email?: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DigiTwin Survey Responses', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Email
  if (email) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Email: ${email}`, margin, yPosition);
    yPosition += 10;
  }

  // Date
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Process each section
  const sections = [...new Set(questions.map(q => q.section))];
  
  sections.forEach((sectionName) => {
    const sectionQuestions = questions.filter(q => q.section === sectionName);
    
    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    // Section title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const sectionLines = pdf.splitTextToSize(sectionName, maxWidth);
    pdf.text(sectionLines, margin, yPosition);
    yPosition += (sectionLines.length * 8) + 10;

    sectionQuestions.forEach((question) => {
      const answer = answers.find(a => a.questionId === question.id);
      
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      // Question
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const questionLines = pdf.splitTextToSize(`Q: ${question.question}`, maxWidth);
      pdf.text(questionLines, margin, yPosition);
      yPosition += (questionLines.length * 6) + 5;

      // Answer
      pdf.setFont('helvetica', 'normal');
      if (answer) {
        if (answer.responseType === 'text' && answer.textAnswer) {
          const answerLines = pdf.splitTextToSize(`A: ${answer.textAnswer}`, maxWidth);
          pdf.text(answerLines, margin, yPosition);
          yPosition += (answerLines.length * 6) + 5;
          
          if (answer.wordCount) {
            pdf.setFontSize(10);
            pdf.text(`Word count: ${answer.wordCount}`, margin, yPosition);
            yPosition += 8;
          }
        } else if (answer.responseType === 'audio') {
          pdf.text('A: Audio response provided', margin, yPosition);
          yPosition += 8;
        }
      } else {
        pdf.text('A: No response provided', margin, yPosition);
        yPosition += 8;
      }
      
      yPosition += 10; // Space between questions
    });

    yPosition += 10; // Space between sections
  });

  // Download the PDF
  const filename = email
    ? `DigiTwin_Survey_${email.replace('@', '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    : `DigiTwin_Survey_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
